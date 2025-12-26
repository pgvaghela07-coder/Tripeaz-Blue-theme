"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import BookingFormContent from "./BookingFormContent";

export default function BookingForm() {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      // Set immediate visibility
      const children = Array.from(formRef.current.children) as HTMLElement[];
      children.forEach(child => {
        child.style.opacity = '1';
      });
    }
  }, []);

  return (
    <section
      id="booking"
    >
      <div className=" bg-gray-50">
        <BookingFormContent showHeader={true} />
      </div>
    </section>
  );
}
