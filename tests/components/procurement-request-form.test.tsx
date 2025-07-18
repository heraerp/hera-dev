/**
 * HERA Procurement System - Procurement Request Form Tests
 * Test the AI-powered procurement request form component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProcurementRequestForm } from '@/components/procurement/procurement-request-form'
import { mockFetch, createMockAIProcessingResult } from '../setup'

// Mock the procurement hook
const mockProcessNaturalLanguage = vi.fn()
const mockSubmitRequest = vi.fn()

vi.mock('@/hooks/useProcurementRequest', () => ({
  useProcurementRequest: () => ({
    processNaturalLanguage: mockProcessNaturalLanguage,
    submitRequest: mockSubmitRequest,
    isProcessing: false,
    isSubmitting: false,
    aiResult: null,
    error: null,
  }),
}))

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ProcurementRequestForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial form with natural language input', () => {
    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText('🤖 AI-Powered Procurement')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe what you need/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /process with ai/i })).toBeInTheDocument()
  })

  it('processes natural language input when form is submitted', async () => {
    const mockAIResult = createMockAIProcessingResult({
      confidence: 0.92,
      parsed_items: [
        {
          item_name: 'Business Laptops',
          quantity: 10,
          unit_price: 1500,
          category: 'IT Equipment',
        },
      ],
      estimated_budget: 15000,
    })

    mockProcessNaturalLanguage.mockResolvedValueOnce(mockAIResult)

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    const textarea = screen.getByPlaceholderText(/describe what you need/i)
    const processButton = screen.getByRole('button', { name: /process with ai/i })

    await user.type(
      textarea,
      'I need 10 laptops for the development team, budget around $15,000'
    )

    await user.click(processButton)

    expect(mockProcessNaturalLanguage).toHaveBeenCalledWith(
      'I need 10 laptops for the development team, budget around $15,000'
    )
  })

  it('displays validation errors for empty input', async () => {
    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    const processButton = screen.getByRole('button', { name: /process with ai/i })
    await user.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/please describe what you need/i)).toBeInTheDocument()
    })
  })

  it('shows processing state during AI analysis', async () => {
    // Mock the hook to return processing state
    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: true,
      isSubmitting: false,
      aiResult: null,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText(/🤖 ai processing your request/i)).toBeInTheDocument()
    expect(screen.getByText(/our ai is analyzing your request/i)).toBeInTheDocument()
  })

  it('displays AI analysis results with confidence score', async () => {
    const mockAIResult = createMockAIProcessingResult({
      confidence: 0.92,
      parsed_items: [
        {
          item_name: 'Business Laptops',
          quantity: 10,
          unit_price: 1500,
          category: 'IT Equipment',
          specifications: '16GB RAM, 512GB SSD',
        },
      ],
      estimated_budget: 15000,
      urgency: 'medium',
      department: 'IT',
    })

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText(/ai analysis complete/i)).toBeInTheDocument()
    expect(screen.getByText(/92% confidence/i)).toBeInTheDocument()
    expect(screen.getByText('Business Laptops')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()
    expect(screen.getByText('$15,000.00')).toBeInTheDocument()
  })

  it('allows editing of parsed items', async () => {
    const mockAIResult = createMockAIProcessingResult()

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    // Find and click edit button for first item
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // Edit the quantity
    const quantityInput = screen.getByDisplayValue('1')
    await user.clear(quantityInput)
    await user.type(quantityInput, '5')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('handles department and urgency selection', async () => {
    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    // Select department
    const departmentSelect = screen.getByRole('combobox', { name: /department/i })
    await user.click(departmentSelect)
    
    const itOption = screen.getByRole('option', { name: /it/i })
    await user.click(itOption)

    // Select urgency
    const urgencySelect = screen.getByRole('combobox', { name: /urgency/i })
    await user.click(urgencySelect)
    
    const urgentOption = screen.getByRole('option', { name: /urgent/i })
    await user.click(urgentOption)

    expect(departmentSelect).toHaveValue('IT')
    expect(urgencySelect).toHaveValue('urgent')
  })

  it('submits the final procurement request', async () => {
    const mockAIResult = createMockAIProcessingResult()

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    mockSubmitRequest.mockResolvedValueOnce({ request_id: 'req-123' })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /submit request/i })
    await user.click(submitButton)

    expect(mockSubmitRequest).toHaveBeenCalledWith({
      aiResult: mockAIResult,
      department: undefined,
      urgency: undefined,
      specialRequirements: [],
    })
  })

  it('displays error messages when AI processing fails', async () => {
    const errorMessage = 'AI service is temporarily unavailable'

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: null,
      error: errorMessage,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText(/error processing request/i)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('adds and removes special requirements', async () => {
    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    // Add special requirement
    const requirementInput = screen.getByPlaceholderText(/add special requirement/i)
    await user.type(requirementInput, 'Must be energy efficient')
    
    const addButton = screen.getByRole('button', { name: /add requirement/i })
    await user.click(addButton)

    expect(screen.getByText('Must be energy efficient')).toBeInTheDocument()

    // Remove requirement
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)

    expect(screen.queryByText('Must be energy efficient')).not.toBeInTheDocument()
  })

  it('shows supplier recommendations when available', async () => {
    const mockAIResult = createMockAIProcessingResult({
      suggested_suppliers: [
        {
          supplier_id: 'supp-001',
          supplier_name: 'TechSupply Corp',
          match_score: 94.5,
          estimated_price: 14800,
          lead_time: 7,
        },
      ],
    })

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText(/supplier recommendations/i)).toBeInTheDocument()
    expect(screen.getByText('TechSupply Corp')).toBeInTheDocument()
    expect(screen.getByText('94.5%')).toBeInTheDocument()
    expect(screen.getByText('7 days')).toBeInTheDocument()
  })

  it('handles form reset functionality', async () => {
    const mockAIResult = createMockAIProcessingResult()

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    // Click start over button
    const startOverButton = screen.getByRole('button', { name: /start over/i })
    await user.click(startOverButton)

    // Form should be reset
    expect(screen.getByPlaceholderText(/describe what you need/i)).toHaveValue('')
    expect(screen.queryByText(/ai analysis complete/i)).not.toBeInTheDocument()
  })

  it('displays compliance flags when present', async () => {
    const mockAIResult = createMockAIProcessingResult({
      compliance_flags: ['IT_SECURITY_REVIEW', 'BUDGET_APPROVAL_REQUIRED'],
    })

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: false,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    expect(screen.getByText(/compliance requirements/i)).toBeInTheDocument()
    expect(screen.getByText(/it security review/i)).toBeInTheDocument()
    expect(screen.getByText(/budget approval required/i)).toBeInTheDocument()
  })

  it('shows loading states correctly during submission', async () => {
    const mockAIResult = createMockAIProcessingResult()

    vi.mocked(vi.importMock('@/hooks/useProcurementRequest')).mockReturnValue({
      processNaturalLanguage: mockProcessNaturalLanguage,
      submitRequest: mockSubmitRequest,
      isProcessing: false,
      isSubmitting: true,
      aiResult: mockAIResult,
      error: null,
    })

    render(
      <TestWrapper>
        <ProcurementRequestForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /submitting/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/submitting request.../i)).toBeInTheDocument()
  })
})