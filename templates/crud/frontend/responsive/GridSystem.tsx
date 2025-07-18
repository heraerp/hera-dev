'use client'

/**
 * HERA Universal Frontend Template - Grid System
 * Responsive grid components following "Don't Make Me Think" principles
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Grid container props
interface GridProps {
  children: React.ReactNode
  className?: string
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  smCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xlCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  auto?: boolean // Auto-fit columns
}

// Grid item props
interface GridItemProps {
  children: React.ReactNode
  className?: string
  // Column spans
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto'
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto'
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto'
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto'
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto'
  // Column starts
  xsStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  smStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  mdStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lgStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xlStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  // Row spans
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
}

// Container component
interface ContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  centered?: boolean
  fluid?: boolean
}

// Gap mapping
const gapClasses = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12'
}

// Column classes
const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
}

// Responsive column classes
const responsiveColClasses = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    7: 'sm:grid-cols-7',
    8: 'sm:grid-cols-8',
    9: 'sm:grid-cols-9',
    10: 'sm:grid-cols-10',
    11: 'sm:grid-cols-11',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    7: 'lg:grid-cols-7',
    8: 'lg:grid-cols-8',
    9: 'lg:grid-cols-9',
    10: 'lg:grid-cols-10',
    11: 'lg:grid-cols-11',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    7: 'xl:grid-cols-7',
    8: 'xl:grid-cols-8',
    9: 'xl:grid-cols-9',
    10: 'xl:grid-cols-10',
    11: 'xl:grid-cols-11',
    12: 'xl:grid-cols-12'
  }
}

// Column span classes
const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
  full: 'col-span-full',
  auto: 'col-auto'
}

// Responsive span classes
const responsiveSpanClasses = {
  sm: {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3',
    4: 'sm:col-span-4',
    5: 'sm:col-span-5',
    6: 'sm:col-span-6',
    7: 'sm:col-span-7',
    8: 'sm:col-span-8',
    9: 'sm:col-span-9',
    10: 'sm:col-span-10',
    11: 'sm:col-span-11',
    12: 'sm:col-span-12',
    full: 'sm:col-span-full',
    auto: 'sm:col-auto'
  },
  md: {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
    full: 'md:col-span-full',
    auto: 'md:col-auto'
  },
  lg: {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
    5: 'lg:col-span-5',
    6: 'lg:col-span-6',
    7: 'lg:col-span-7',
    8: 'lg:col-span-8',
    9: 'lg:col-span-9',
    10: 'lg:col-span-10',
    11: 'lg:col-span-11',
    12: 'lg:col-span-12',
    full: 'lg:col-span-full',
    auto: 'lg:col-auto'
  },
  xl: {
    1: 'xl:col-span-1',
    2: 'xl:col-span-2',
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    5: 'xl:col-span-5',
    6: 'xl:col-span-6',
    7: 'xl:col-span-7',
    8: 'xl:col-span-8',
    9: 'xl:col-span-9',
    10: 'xl:col-span-10',
    11: 'xl:col-span-11',
    12: 'xl:col-span-12',
    full: 'xl:col-span-full',
    auto: 'xl:col-auto'
  }
}

// Column start classes
const startClasses = {
  1: 'col-start-1',
  2: 'col-start-2',
  3: 'col-start-3',
  4: 'col-start-4',
  5: 'col-start-5',
  6: 'col-start-6',
  7: 'col-start-7',
  8: 'col-start-8',
  9: 'col-start-9',
  10: 'col-start-10',
  11: 'col-start-11',
  12: 'col-start-12'
}

// Row span classes
const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6'
}

// Container max width classes
const containerMaxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

// Grid component
export const Grid: React.FC<GridProps> = ({
  children,
  className = '',
  gap = 'md',
  cols = 12,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  auto = false
}) => {
  const gridClasses = cn(
    'grid',
    auto ? 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]' : colClasses[cols],
    smCols && responsiveColClasses.sm[smCols],
    mdCols && responsiveColClasses.md[mdCols],
    lgCols && responsiveColClasses.lg[lgCols],
    xlCols && responsiveColClasses.xl[xlCols],
    gapClasses[gap],
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Grid item component
export const GridItem: React.FC<GridItemProps> = ({
  children,
  className = '',
  xs,
  sm,
  md,
  lg,
  xl,
  xsStart,
  smStart,
  mdStart,
  lgStart,
  xlStart,
  rowSpan
}) => {
  const itemClasses = cn(
    xs && spanClasses[xs],
    sm && responsiveSpanClasses.sm[sm],
    md && responsiveSpanClasses.md[md],
    lg && responsiveSpanClasses.lg[lg],
    xl && responsiveSpanClasses.xl[xl],
    xsStart && startClasses[xsStart],
    smStart && `sm:${startClasses[smStart]}`,
    mdStart && `md:${startClasses[mdStart]}`,
    lgStart && `lg:${startClasses[lgStart]}`,
    xlStart && `xl:${startClasses[xlStart]}`,
    rowSpan && rowSpanClasses[rowSpan],
    className
  )

  return (
    <div className={itemClasses}>
      {children}
    </div>
  )
}

// Container component
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  centered = true,
  fluid = false
}) => {
  const containerClasses = cn(
    'w-full',
    !fluid && containerMaxWidths[maxWidth],
    centered && 'mx-auto',
    'px-4 sm:px-6 lg:px-8', // Default responsive padding
    className
  )

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

// Flexbox utilities
interface FlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Flex: React.FC<FlexProps> = ({
  children,
  className = '',
  direction = 'row',
  align,
  justify,
  wrap,
  gap = 'md'
}) => {
  const flexClasses = cn(
    'flex',
    {
      'flex-row': direction === 'row',
      'flex-col': direction === 'col',
      'flex-row-reverse': direction === 'row-reverse',
      'flex-col-reverse': direction === 'col-reverse'
    },
    {
      'items-start': align === 'start',
      'items-end': align === 'end',
      'items-center': align === 'center',
      'items-baseline': align === 'baseline',
      'items-stretch': align === 'stretch'
    },
    {
      'justify-start': justify === 'start',
      'justify-end': justify === 'end',
      'justify-center': justify === 'center',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly'
    },
    {
      'flex-wrap': wrap === 'wrap',
      'flex-nowrap': wrap === 'nowrap',
      'flex-wrap-reverse': wrap === 'wrap-reverse'
    },
    gapClasses[gap],
    className
  )

  return (
    <div className={flexClasses}>
      {children}
    </div>
  )
}

// Stack component (vertical flex)
export const Stack: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
  <Flex direction="col" {...props} />
)

// Common layout patterns
export const Sidebar: React.FC<{
  children: React.ReactNode
  sidebar: React.ReactNode
  sidebarWidth?: 'sm' | 'md' | 'lg'
  sidebarPosition?: 'left' | 'right'
  className?: string
}> = ({ 
  children, 
  sidebar, 
  sidebarWidth = 'md', 
  sidebarPosition = 'left',
  className = '' 
}) => {
  const sidebarWidths = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  }

  return (
    <div className={cn('flex min-h-screen', className)}>
      {sidebarPosition === 'left' && (
        <aside className={cn('flex-shrink-0', sidebarWidths[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
      
      <main className="flex-1 min-w-0">
        {children}
      </main>
      
      {sidebarPosition === 'right' && (
        <aside className={cn('flex-shrink-0', sidebarWidths[sidebarWidth])}>
          {sidebar}
        </aside>
      )}
    </div>
  )
}

// Two-column layout
export const TwoColumn: React.FC<{
  children: React.ReactNode
  left: React.ReactNode
  right: React.ReactNode
  leftWidth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  className?: string
}> = ({ children, left, right, leftWidth = 8, className = '' }) => {
  const rightWidth = 12 - leftWidth

  return (
    <Grid cols={12} className={className}>
      <GridItem xs={12} lg={leftWidth}>
        {left}
      </GridItem>
      <GridItem xs={12} lg={rightWidth as any}>
        {right}
      </GridItem>
      {children}
    </Grid>
  )
}

// Three-column layout
export const ThreeColumn: React.FC<{
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
  leftWidth?: number
  rightWidth?: number
  className?: string
}> = ({ left, center, right, leftWidth = 3, rightWidth = 3, className = '' }) => {
  const centerWidth = 12 - leftWidth - rightWidth

  return (
    <Grid cols={12} className={className}>
      <GridItem xs={12} lg={leftWidth as any}>
        {left}
      </GridItem>
      <GridItem xs={12} lg={centerWidth as any}>
        {center}
      </GridItem>
      <GridItem xs={12} lg={rightWidth as any}>
        {right}
      </GridItem>
    </Grid>
  )
}

export default {
  Grid,
  GridItem,
  Container,
  Flex,
  Stack,
  Sidebar,
  TwoColumn,
  ThreeColumn
}