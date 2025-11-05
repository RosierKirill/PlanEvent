"use client";

import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import * as React from "react";

interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
}

interface CalendarWrapperProps {
  events: Event[];
}

export default function CalendarWrapper({ events }: CalendarWrapperProps) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Wait a tick to ensure Temporal is fully loaded
    const timer = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const calendarEvents = React.useMemo(() => {
    if (!isReady || typeof window === "undefined" || !("Temporal" in window)) {
      return [];
    }

    const { Temporal } = window as any;

    console.log("Raw events:", events);

    const mappedEvents = events.map((event) => {
      console.log("Processing event:", event.name, {
        startDate: event.startDate,
        endDate: event.endDate,
      });

      // Parse ISO date strings with timezone
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Check if it's a multi-day event (more than 24 hours)
      const durationHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      const isMultiDay = durationHours >= 24;

      // Extract date part in local timezone
      const startYear = startDate.getFullYear();
      const startMonth = String(startDate.getMonth() + 1).padStart(2, "0");
      const startDay = String(startDate.getDate()).padStart(2, "0");
      const startDateStr = `${startYear}-${startMonth}-${startDay}`;

      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, "0");
      const endDay = String(endDate.getDate()).padStart(2, "0");
      const endDateStr = `${endYear}-${endMonth}-${endDay}`;

      if (isMultiDay) {
        // For multi-day events, use PlainDate to show on all days
        // Note: end date should be the day AFTER the last day (exclusive)
        const startPlainDate = Temporal.PlainDate.from(startDateStr);
        const endPlainDate = Temporal.PlainDate.from(endDateStr);
        const endPlusOne = endPlainDate.add({ days: 1 });

        const calEvent = {
          id: String(event.id),
          title: event.name,
          description: event.description,
          location: event.location,
          start: startPlainDate,
          end: endPlusOne,
          calendarId: "user-events",
        };
        console.log("Created multi-day event:", calEvent);
        return calEvent;
      } else {
        // For same-day timed events, use ZonedDateTime
        const startInstant = Temporal.Instant.from(event.startDate);
        const endInstant = Temporal.Instant.from(event.endDate);
        const timeZone = Temporal.Now.timeZoneId();

        const calEvent = {
          id: String(event.id),
          title: event.name,
          description: event.description,
          location: event.location,
          start: startInstant.toZonedDateTimeISO(timeZone),
          end: endInstant.toZonedDateTimeISO(timeZone),
          calendarId: "user-events",
        };
        console.log("Created timed event:", calEvent);
        return calEvent;
      }
    });

    console.log("Final calendar events:", mappedEvents);
    return mappedEvents;
  }, [events, isReady]);

  // Get today's date as Temporal.PlainDate
  const today = React.useMemo(() => {
    if (!isReady || typeof window === "undefined" || !("Temporal" in window)) {
      return null;
    }
    const { Temporal } = window as any;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return Temporal.PlainDate.from(`${year}-${month}-${day}`);
  }, [isReady]);

  const calendarApp = useNextCalendarApp({
    views: [
      createViewMonthGrid(),
      createViewWeek(),
      createViewDay(),
      createViewMonthAgenda(),
    ],
    defaultView: "month-grid",
    theme: "shadcn",
    calendars: {
      "user-events": {
        label: "Mes événements",
        colorName: "user-events",
        lightColors: {
          main: "#8b5cf6",
          container: "#e0d7fe",
          onContainer: "#1f2937",
        },
        darkColors: {
          main: "#8b5cf6",
          container: "#374151",
          onContainer: "#f9fafb",
        },
      },
    },
    selectedDate: today || undefined,
    locale: "fr-FR",
  });

  // Update events when they change
  React.useEffect(() => {
    if (calendarApp && calendarEvents.length > 0) {
      console.log("Setting calendar events:", calendarEvents);
      calendarApp.events.set(calendarEvents);
    }
  }, [calendarApp, calendarEvents]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-[700px] border rounded-md bg-card">
        <p className="text-muted-foreground">Initialisation du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-card p-4">
      <ScheduleXCalendar calendarApp={calendarApp} />
    </div>
  );
}
