type Props = {
  src: string;
  alt: string;
};

export function Image({ src, alt }: Props) {
  return (
    <img
      className="animate-scale-in block h-[min(22vh,11.25rem)] w-full max-w-[51.25rem] rounded-sm object-cover"
      src={src}
      alt={alt}
    />
  );
}
