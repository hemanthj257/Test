import dayjs from 'dayjs';

export const getCurrentJST = () => {
  
return dayjs().format('YYYY-MM-DD HH:mm:ss');
};

export const getAddToCurrentJST = (num: number, unit: dayjs.ManipulateType) => {
 
  return dayjs().add(num, unit).format('YYYY-MM-DD HH:mm:ss');
};

export const isAfterCurrentJST = (time: string) => {

  return dayjs().isAfter(dayjs(time));
};
