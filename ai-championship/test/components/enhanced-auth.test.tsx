import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EnhancedAuth } from '@/components/enhanced-auth'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

describe('EnhancedAuth Component Integration', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  beforeEach(async () => {
    if (global.testAuth?.currentUser) {
      await global.testAuth.signOut()
    }
  })

  it('should render candidate login form', () => {
    render(<EnhancedAuth mode="login" userType="candidate" />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Candidate Account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should render employer signup form', () => {
    render(<EnhancedAuth mode="signup" userType="employer" />)
    
    expect(screen.getByText('Join HireVision')).toBeInTheDocument()
    expect(screen.getByText('Employer Account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
  })

  it('should handle email signup with real Firebase', async () => {
    const mockOnSuccess = jest.fn()
    
    render(<EnhancedAuth mode="signup" userType="candidate" onSuccess={mockOnSuccess} />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: testEmail }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: testPassword }
    })

    fireEvent.click(screen.getByText('Create Account'))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    }, { timeout: 10000 })

    expect(global.testAuth.currentUser).toBeTruthy()
    expect(global.testAuth.currentUser.email).toBe(testEmail)
  })

  it('should show error for invalid login', async () => {
    render(<EnhancedAuth mode="login" userType="candidate" />)
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    })

    fireEvent.click(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(screen.getByText(/Login Failed/)).toBeInTheDocument()
    })
  })
})