const ytImageSizes: [width: number, urlPart: string][] = [
  [320, 'mq'],
  [480, 'hq'],
  [640, 'sd'],
  [1280, 'maxres'],
];

export const ytSrcset = (id: string): string =>
  ytImageSizes
    .map(
      ([width, urlPart]) =>
        `https://i.ytimg.com/vi/${id}/${urlPart}default.jpg ${width}w`,
    )
    .join(', ');

export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
