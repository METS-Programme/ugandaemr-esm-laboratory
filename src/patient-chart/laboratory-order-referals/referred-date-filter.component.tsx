import React, { useState, useEffect } from "react";
import { DatePicker, DatePickerInput } from "@carbon/react";
import dayjs from "dayjs";

interface ReferredDateFilterProps {
  date?: string;
  setDate: (date: string) => void;
}

const ReferredDateFilter = (props: ReferredDateFilterProps) => {
  const [date, setDate] = useState(props.date || "");

  useEffect(() => {
    setDate(props.date || "");
  }, [props.date]);

  const handleDateChange = (event: any) => {
    const selectedDate = event[0]?.toISOString().split("T")[0];
    if (selectedDate) {
      setDate(selectedDate);
      props.setDate(selectedDate);
    }
  };

  return (
    <DatePicker
      datePickerType="single"
      dateFormat="Y-m-d"
      onChange={handleDateChange}
    >
      <DatePickerInput
        placeholder="YYYY-MM-DD"
        id="referred-date-picker-single"
        size="md"
        value={dayjs(date).format("YYYY-MM-DD")}
      />
    </DatePicker>
  );
};

export default ReferredDateFilter;
