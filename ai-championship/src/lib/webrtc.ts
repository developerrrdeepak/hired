import { db } from '@/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

export const createRoom = async (
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>
): Promise<string> => {
  pc = new RTCPeerConnection(servers);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    pc!.addTrack(track, localStream!);
  });

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream!.addTrack(track);
    });
  };

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = localStream;
  }
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteStream;
  }

  const callDoc = doc(collection(db, 'calls'));
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDoc, { offer });

  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!pc?.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc!.setRemoteDescription(answerDescription);
    }
  });

  onSnapshot(collection(callDoc, 'answerCandidates'), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc!.addIceCandidate(candidate);
      }
    });
  });

  return callDoc.id;
};

export const joinRoom = async (
  roomId: string,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>
) => {
  const callDoc = doc(db, 'calls', roomId);
  const offerCandidates = collection(callDoc, 'offerCandidates');
  const answerCandidates = collection(callDoc, 'answerCandidates');

  pc = new RTCPeerConnection(servers);

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    pc!.addTrack(track, localStream!);
  });

  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream!.addTrack(track);
    });
  };
  
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = localStream;
  }
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteStream;
  }

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
  };

  const callData = (await getDoc(callDoc)).data();
  const offerDescription = callData?.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        let data = change.doc.data();
        pc!.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};

export const endCall = async (roomId: string) => {
    if (pc) {
        pc.close();
        pc = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }

    if (roomId) {
        const callDoc = doc(db, 'calls', roomId);
        const offerCandidates = await getDocs(collection(callDoc, 'offerCandidates'));
        offerCandidates.forEach(async (candidate) => {
            await deleteDoc(candidate.ref);
        });
        const answerCandidates = await getDocs(collection(callDoc, 'answerCandidates'));
        answerCandidates.forEach(async (candidate) => {
            await deleteDoc(candidate.ref);
        });
        await deleteDoc(callDoc);
    }
};
