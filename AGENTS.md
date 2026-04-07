UI IMPLEMENTATION PROMPT
You are building the frontend for a web-based classroom allocation and rescheduling system using Next.js (App Router), Tailwind CSS, shadcn/ui, Framer Motion, and Inter font. Follow these instructions strictly.

1. Design System
Colors
Primary: Blue (shadcn default blue: #3b82f6 or hsl(221.2 83.2% 53.3%))

Background: White (#ffffff) and very light gray (#f8fafc) for subtle sections

Text: Dark gray (#0f172a) for primary, medium gray (#475569) for secondary

Accents: Use blue gradients sparingly (e.g., for hero titles or buttons on hover)

Typography
Font: Inter (variable), fallback to system-ui

Font weights: 400 (regular), 500 (medium), 600 (semibold)

Line heights: 1.5 for body, 1.2 for headings

Responsive sizes: mobile 14px base, desktop 16px base

Spacing & Layout
Mobile-first: design for 375px width first, then use md: and lg: breakpoints

Container max-width: 1280px with mx-auto and px-4 (mobile), px-6 (desktop)

Grid system: Tailwind's flex/grid with responsive columns

Border Radius
Default: 0.75rem (12px) for cards, buttons, inputs

Small elements: 0.5rem (8px)

Full pill: 9999px for badges, avatars

Shadows
Use Tailwind's shadow-sm, shadow-md, shadow-lg with subtle blur

Hover states: hover:shadow-md transition-shadow duration-200

2. Animation Guidelines (Apple-like)
All animations must feel smooth, responsive, and lightweight – mimicking iOS/macOS.

Duration: Fast (150–200ms) for micro-interactions, medium (300ms) for page transitions

Easing: Use cubic-bezier(0.2, 0.9, 0.4, 1.1) or Tailwind's ease-out

Opacity + Y-axis for fading elements in (y: 10px → 0)

Scale for buttons on tap: scale(0.97) with whileTap

Stagger children for lists (admin requests, timetable rows)

Page transitions: FadeIn with slight upward motion when navigating

Required Framer Motion Variants
ts
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } }
}

const scaleTap = { scale: 0.97 }
3. shadcn/ui Components – Mandatory Use
Install and use these shadcn components for consistency:

Component	Use case
Button	All clickable actions (primary, outline, ghost, destructive)
Card	Dashboard widgets, request cards, timetable cells
Input	Forms, search bars
Label	Form field labels
Select	Dropdowns (course selection, hall selection)
Dialog	Modals (approve request, confirm action)
Sheet	Mobile sidebar (if needed)
DropdownMenu	User avatar menu (logout, profile)
Avatar	User profile image placeholder
Badge	Status indicators (pending/approved/rejected, rescheduled tag)
Toast	Success/error notifications
Separator	Dividers between sections
Skeleton	Loading states for timetable and search results
Tabs	Admin dashboard (Halls, Courses, Timetable, Requests)
AlertDialog	Critical confirmations (e.g., delete hall)
Customization
Override shadcn theme variables in globals.css to match white/blue theme

Keep the rounded-xl default for cards

Use variant="default" for primary blue buttons, variant="outline" for secondary

4. Reusable Custom Components (Build These)
Create these motion-enhanced wrappers in components/ui/:

4.1 PageTransition.tsx
Wraps page content with fade-in-up animation.

tsx
"use client";
import { motion } from "framer-motion";

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
4.2 StaggerList.tsx
Staggers child animations.

tsx
import { motion } from "framer-motion";

export function StaggerList({ children, className = "" }) {
  return (
    <motion.div
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }) {
  return (
    <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
      {children}
    </motion.div>
  );
}
4.3 AnimatedButton.tsx
Adds tap scale to shadcn button.

tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AnimatedButton({ children, ...props }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}>
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
4.4 LoadingSkeleton.tsx
Reusable skeleton for timetable rows.

tsx
import { Skeleton } from "@/components/ui/skeleton";

export function TimetableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
4.5 NotificationBadge.tsx
Animated bell with badge count.

tsx
"use client";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export function NotificationBadge({ count = 0 }) {
  return (
    <div className="relative cursor-pointer">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
        >
          {count}
        </motion.span>
      )}
    </div>
  );
}
5. Page-Specific UI Requirements
5.1 Login Page
Centered card with white background, blue border top

Two fields: Student ID, Password

Submit button: full-width, blue, with loading spinner on submit

Animation: card slides up + fades in

Mobile: full width card with mx-4

5.2 Student Dashboard
Top bar: Welcome text (left), NotificationBadge + Avatar (right)

Main area: Timetable grid (responsive table or card-based for mobile)

On mobile: vertical list of days, each day shows course cards

On desktop: traditional grid table

Search sidebar: On desktop as right column; on mobile as collapsible section or bottom sheet

Search input: Debounced, with loading skeleton, results as cards

5.3 Course Rep Request Form
Dialog or separate page with form

Select course (populated from rep's assigned courses)

Date/time picker (only future sessions)

Preferred hall dropdown (filtered by availability)

Reason textarea

Submit button with loading state

On success: toast notification, close modal, refresh request list

5.4 Admin Dashboard
Tabs (shadcn Tabs) for: Halls, Courses, Timetable, Pending Requests

Each tab has a data table (use simple div grid or shadcn Table component)

Pending Requests: each request as a card with approve/reject buttons

Approve opens a Dialog showing available halls (with checkboxes)

All forms (add/edit hall/course) use shadcn Dialog with Form components

6. Responsive Breakpoints
Breakpoint	Min width	Layout changes
Mobile	0px	Single column, stacked cards, bottom sheets for filters
Tablet	768px	Two columns, sidebar appears, larger touch targets
Desktop	1024px	Three columns (dashboard), full table view, hover effects
7. Performance & Accessibility
Use next/dynamic for modals and heavy components

Lazy load images (none really, but keep in mind)

All buttons must have aria-label when icon-only

Focus states: ring-2 ring-blue-500 ring-offset-2

Color contrast: blue on white passes WCAG AA

Motion: respect prefers-reduced-motion by disabling animations if detected (use Framer Motion's disable prop)

8. Example Implementation Snippet (Student Dashboard)
tsx
// app/(dashboard)/student/page.tsx
"use client";
import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Classroom Allocation</h1>
            <div className="flex items-center gap-4">
              <NotificationBadge count={3} />
              <Avatar>
                <AvatarFallback>KM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="p-4">
                <TimetableGrid />
              </Card>
            </div>
            <div>
              <Card className="p-4">
                <SearchBar />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
9. Deliverables Checklist
Tailwind config with Inter font and custom radii

shadcn/ui installed and configured with blue theme

All required shadcn components installed

Custom motion components created (PageTransition, StaggerList, AnimatedButton)

Login page with Apple-like card animation

Student dashboard responsive (mobile/tablet/desktop)

Admin dashboard with tabs and request approval flow

All forms use shadcn Input, Label, Select, Dialog

Loading skeletons for async data

Toast notifications for success/error

Tap scale animations on all buttons

Staggered list animations for pending requests

Final UI matches white/blue color scheme exactly

Use this prompt as your single source of truth for frontend implementation. 