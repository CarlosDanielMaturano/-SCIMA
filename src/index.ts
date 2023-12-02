const FileInput: HTMLInputElement = document.getElementById(
  'image-input',
) as HTMLInputElement;

const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const imageContainer: HTMLImageElement = document.getElementById(
  'image-container',
) as HTMLImageElement;

const display: HTMLElement = document.getElementById('pre') as HTMLElement;

interface ImageDimensions {
  w: number;
  h: number;
}

interface RGBColor {
  R: number;
  G: number;
  B: number;
}

if (!FileInput) {
  throw new Error('Could not find the input');
}

const calcAspectRatio = (dimensions: ImageDimensions): ImageDimensions => {
  const maxWidth = Math.floor(dimensions.w / 6);
  const maxHeight = Math.floor(dimensions.h / 6);

  const { w, h } = dimensions;
  console.log(w, h);

  return {
    w: w * (maxHeight / h),
    h: h * (maxWidth / w),
  };
};

const rgbToGrayScale = (color: RGBColor): number => {
  const Y = color.R * 0.299 + color.G * 0.587 + color.B * 0.114;
  return Y;
};

const convertToGrayScale = (): Array<number> => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const grayValues: Array<number> = [];

  for (let y = 0; y < pixels.length; y += 4) {
    const [R, G, B] = [pixels[y], pixels[y + 1], pixels[y + 2]];
    const grayScaleValue = rgbToGrayScale({ R, G, B });
    pixels[y] = pixels[y + 1] = pixels[y + 2] = grayScaleValue;
    grayValues.push(grayScaleValue);
  }

  ctx.putImageData(imageData, 0, 0);
  return grayValues;
};

const getCharFromGray = (grayScale: number) => {
  const chars =
    ' @B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
  const charsSize = chars.length;

  return chars[Math.ceil(((charsSize - 1) * grayScale) / 255)];
};

const drawAscii = (grayValues: Array<number>, width: number) => {
  const ascii = grayValues.reduce((asciiImage, grayScale, index) => {
    let nextChar = getCharFromGray(grayScale);

    // check if the index reaches the last item in the col
    if ((index + 1) % width === 0) nextChar += '\n';

    return asciiImage + nextChar;
  }, '');

  display.textContent = ascii;
};

const drawImageOnCanvas = (image: HTMLImageElement): void => {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const grayValues: Array<number> = convertToGrayScale();
  drawAscii(grayValues, canvas.width);
};

const loadImage = (source: string): void => {
  const image: HTMLImageElement = new Image();
  image.src = source;
  image.onload = () => {
    const newDimensions = calcAspectRatio({
      w: image.naturalWidth,
      h: image.naturalHeight,
    });
    image.width = newDimensions.w;
    image.height = newDimensions.h;
    drawImageOnCanvas(image);
  };
};

const readImage = (imageFile: File) => {
  const reader: FileReader = new FileReader();
  reader.onload = (event) => loadImage(event.target.result as string);
  reader.readAsDataURL(imageFile);
};

FileInput.addEventListener('change', () => {
  const imageFile = FileInput?.files[0];
  if (!imageFile) {
    throw new Error('no file found');
  }
  readImage(imageFile);
});
