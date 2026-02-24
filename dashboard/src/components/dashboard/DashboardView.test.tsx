import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardView from './DashboardView'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
        circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    Tooltip: () => <div>Tooltip</div>,
    RadialBarChart: () => <div>RadialBarChart</div>,
    RadialBar: () => <div>RadialBar</div>,
}))

describe('DashboardView', () => {
    it('renders the welcome message', () => {
        const onNavigate = vi.fn()
        render(<DashboardView onNavigate={onNavigate} />)

        expect(screen.getByText(/Ciao, studente!/i)).toBeInTheDocument()
    })

    it('renders the main countdown', () => {
        const onNavigate = vi.fn()
        render(<DashboardView onNavigate={onNavigate} />)

        expect(screen.getByText(/Prossimo Esame/i)).toBeInTheDocument()
        expect(screen.getAllByText(/Diritto Privato/i)).toHaveLength(2)
    })
})
