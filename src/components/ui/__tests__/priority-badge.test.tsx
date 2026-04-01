import { render, screen } from '@testing-library/react'
import { PriorityBadge } from '../priority-badge'

describe('PriorityBadge', () => {
  it('renders critical priority with correct styling', () => {
    render(<PriorityBadge priority="CRITICAL" />)
    const badge = screen.getByText(/critical/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-red-100')
  })

  it('renders high priority with correct styling', () => {
    render(<PriorityBadge priority="HIGH" />)
    const badge = screen.getByText(/high/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-orange-100')
  })

  it('renders medium priority with correct styling', () => {
    render(<PriorityBadge priority="MEDIUM" />)
    const badge = screen.getByText(/medium/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('renders low priority with correct styling', () => {
    render(<PriorityBadge priority="LOW" />)
    const badge = screen.getByText(/low/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100')
  })

  it('renders icon for each priority', () => {
    const { rerender } = render(<PriorityBadge priority="CRITICAL" />)
    expect(screen.getByText('⚡')).toBeInTheDocument()

    rerender(<PriorityBadge priority="HIGH" />)
    expect(screen.getByText('↑')).toBeInTheDocument()

    rerender(<PriorityBadge priority="MEDIUM" />)
    expect(screen.getByText('→')).toBeInTheDocument()

    rerender(<PriorityBadge priority="LOW" />)
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<PriorityBadge priority="HIGH" className="custom-class" />)
    const badge = screen.getByText(/high/i)
    expect(badge).toHaveClass('custom-class')
  })
})
