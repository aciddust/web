import { date, yyyyMM } from "./store";
import { padZero } from "./utils";

export const updateCalendar = () => {
  // 지금은 utils에 넣어뒀지만 common으로 빼야함
  yyyyMM.update(() => {
    return ""
  })
  const date: Date = new Date()
  const newYYMM = `${date.getFullYear()}${padZero(date.getMonth() + 1)}`
  yyyyMM.update(() => {
    return newYYMM;
  })
}
