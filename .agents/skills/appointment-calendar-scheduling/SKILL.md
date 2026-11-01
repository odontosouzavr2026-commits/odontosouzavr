---
name: appointment-calendar-scheduling
description: "Architect and implement clinical calendar scheduling, time-slot allocation, double-booking prevention, multi-professional agenda views, and appointment status workflows in Next.js, React, and Supabase PostgreSQL."
---

# Clinical Appointment & Calendar Scheduling Patterns

Architecture, database schemas, conflict-resolution logic, and frontend patterns for building interactive dental and healthcare scheduling calendars with Next.js, React, and Supabase (PostgreSQL).

---

## 📌 Use this skill when:
- Designing or implementing interactive calendar views (Month, Week, Day, and Multi-dentist/Chair resource views).
- Structuring database tables for appointments, clinical working hours, lunch breaks, and holidays.
- Preventing simultaneous scheduling conflicts (**double-booking**) using PostgreSQL constraints or atomic transactions.
- Managing the appointment lifecycle state machine (`SCHEDULED` ➔ `CONFIRMED` ➔ `WAITING_ROOM` ➔ `IN_TREATMENT` ➔ `COMPLETED` ➔ `CANCELLED`).
- Calculating available time slots dynamically based on procedure duration (e.g., 30min cleaning vs 90min canal treatment).

## ⛔ Do not use this skill when:
- The task is a simple static date picker (`<input type="date" />`) without calendar views, availability logic, or conflict prevention.
- The task is cron-based recurring background task scheduling (use automation/cron tools instead).

---

## 🗄️ Relational Schema for Supabase (PostgreSQL)

```sql
-- Enable btree_gist extension for double-booking exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enum for Appointment Status
CREATE TYPE appointment_status AS ENUM (
  'SCHEDULED',       -- Agendado
  'CONFIRMED',       -- Confirmado pelo paciente (WhatsApp/SMS)
  'WAITING_ROOM',     -- Paciente chegou na clínica
  'IN_TREATMENT',    -- Em atendimento na cadeira
  'COMPLETED',       -- Procedimento finalizado
  'CANCELLED',       -- Cancelado
  'NO_SHOW'          -- Faltou sem aviso prévio
);

-- Appointments Table with Double-Booking Prevention
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICTED,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES dental_procedures(id),
  chair_number INT DEFAULT 1,
  
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'SCHEDULED' NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Validate start before end
  CONSTRAINT check_valid_time_range CHECK (start_time < end_time),

  -- PREVENT DOUBLE-BOOKING:
  -- A dentist cannot have overlapping active appointments!
  -- Uses PostgreSQL TSRANGE with EXCLUDE constraint
  CONSTRAINT prevent_dentist_double_booking EXCLUDE USING gist (
    dentist_id WITH =,
    tsrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('CANCELLED', 'NO_SHOW'))
);

-- Indexes for lightning-fast calendar range queries
CREATE INDEX idx_appointments_dentist_range 
  ON appointments (dentist_id, start_time, end_time);

CREATE INDEX idx_appointments_date_lookup 
  ON appointments (start_time);
```

---

## 🧠 Business Logic: Dynamic Available Slot Calculation

To calculate available slots for a given dentist and date:
1. Retrieve the dentist's working hours for that weekday (e.g., 08:00–12:00, 14:00–18:00).
2. Retrieve existing non-cancelled appointments for that dentist on that date.
3. Slice available working blocks into slot intervals matching procedure duration (e.g., 30 min increments).
4. Remove slots overlapping with existing appointments, clinic lunch breaks, or holidays.

```typescript
// lib/scheduling/slots.ts
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export function generateAvailableSlots(
  dayStart: Date,
  dayEnd: Date,
  bookedRanges: Array<{ start: Date; end: Date }>,
  durationMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let current = new Date(dayStart);

  while (current.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
    
    // Check if slot overlaps with any booked range
    const isBooked = bookedRanges.some(booking => 
      current < booking.end && slotEnd > booking.start
    );

    slots.push({
      start: new Date(current),
      end: slotEnd,
      available: !isBooked
    });

    current = slotEnd;
  }

  return slots;
}
```

---

## 🎨 Frontend Architecture Patterns (React & Next.js)

### 1. Recommended Libraries:
- **`@fullcalendar/react`** (FullCalendar Standard):
  - Standard for multi-resource scheduling (viewing multiple dentists/dental chairs side-by-side).
  - TimeGrid week/day views, drag-and-drop rescheduling, and event resizing.
- **`react-big-calendar`** (Lightweight Alternative):
  - Highly customizable with custom React event cards and Tailwind styling.
- **Shadcn UI + `date-fns`**:
  - Perfect for patient-facing self-scheduling widgets (step-by-step: select dentist ➔ select date ➔ select time slot).

### 2. FullCalendar Integration with Tailwind & Brazilian Locale:

```tsx
'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

interface CalendarProps {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor?: string;
    borderColor?: string;
    extendedProps: { patientName: string; status: string; procedure: string };
  }>;
  onEventClick: (appointmentId: string) => void;
  onDateSelect: (start: Date, end: Date) => void;
}

export function DentalCalendar({ events, onEventClick, onDateSelect }: CalendarProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        selectable={true}
        selectMirror={true}
        nowIndicator={true}
        events={events}
        select={(info) => onDateSelect(info.start, info.end)}
        eventClick={(info) => onEventClick(info.event.id)}
        height="auto"
      />
    </div>
  );
}
```

---

## 🔒 Concurrency & Atomic Booking in Server Actions

```typescript
// app/actions/appointments.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAppointment(data: {
  dentistId: string;
  patientId: string;
  procedureId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const supabase = createServerClient();

  // Insert appointment - the Postgres EXCLUDE constraint guarantees
  // atomic protection against double booking even under simultaneous requests
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      dentist_id: data.dentistId,
      patient_id: data.patientId,
      procedure_id: data.procedureId,
      start_time: data.startTime,
      end_time: data.endTime,
      status: 'SCHEDULED',
      notes: data.notes
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') { // PostgreSQL exclusion_violation
      return { success: false, error: 'Horário já reservado por outro atendimento. Por favor, escolha outro slot.' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/agenda');
  return { success: true, appointment };
}
```

---

## ✅ Best Practice Checklist
- [ ] Always store timestamps in UTC (`TIMESTAMPTZ`) in the database; convert to `America/Sao_Paulo` in the UI.
- [ ] Enforce the PostgreSQL `EXCLUDE` constraint with `tsrange` to make double-booking physically impossible at the database level.
- [ ] Color-code calendar event blocks by status (e.g., Blue: Agendado, Green: Confirmado, Amber: Na Recepção, Gray: Concluído).
- [ ] Provide buffer times between appointments for sanitization and procedure prep.
- [ ] Support easy drag-and-drop rescheduling with confirmation dialogs.
