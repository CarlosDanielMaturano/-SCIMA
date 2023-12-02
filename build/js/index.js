const FileInput = document.getElementById('image-input');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const imageContainer = document.getElementById('image-container');
const display = document.getElementById('pre');
if (!FileInput) {
    throw new Error('Could not find the input');
}
const calcAspectRatio = (dimensions) => {
    const maxWidth = Math.floor(dimensions.w / 6);
    const maxHeight = Math.floor(dimensions.h / 6);
    const { w, h } = dimensions;
    console.log(w, h);
    return {
        w: w * (maxHeight / h),
        h: h * (maxWidth / w),
    };
};
const rgbToGrayScale = (color) => {
    const Y = color.R * 0.299 + color.G * 0.587 + color.B * 0.114;
    return Y;
};
const convertToGrayScale = () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const grayValues = [];
    for (let y = 0; y < pixels.length; y += 4) {
        const [R, G, B] = [pixels[y], pixels[y + 1], pixels[y + 2]];
        const grayScaleValue = rgbToGrayScale({ R, G, B });
        pixels[y] = pixels[y + 1] = pixels[y + 2] = grayScaleValue;
        grayValues.push(grayScaleValue);
    }
    ctx.putImageData(imageData, 0, 0);
    return grayValues;
};
const getCharFromGray = (grayScale) => {
    const chars = ' @B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    const charsSize = chars.length;
    return chars[Math.ceil(((charsSize - 1) * grayScale) / 255)];
};
const drawAscii = (grayValues, width) => {
    const ascii = grayValues.reduce((asciiImage, grayScale, index) => {
        let nextChar = getCharFromGray(grayScale);
        if ((index + 1) % width === 0)
            nextChar += '\n';
        return asciiImage + nextChar;
    }, '');
    display.textContent = ascii;
};
const drawImageOnCanvas = (image) => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const grayValues = convertToGrayScale();
    drawAscii(grayValues, canvas.width);
};
const loadImage = (source) => {
    const image = new Image();
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
const readImage = (imageFile) => {
    const reader = new FileReader();
    reader.onload = (event) => loadImage(event.target.result);
    reader.readAsDataURL(imageFile);
};
FileInput.addEventListener('change', () => {
    const imageFile = FileInput === null || FileInput === void 0 ? void 0 : FileInput.files[0];
    if (!imageFile) {
        throw new Error('no file found');
    }
    readImage(imageFile);
});
