type Props = {
  children: React.ReactNode;
};

export function CardGrid({ children }: Props) {
  return (
    <div className="flex max-w-[56.25rem] flex-wrap justify-center gap-7">
      {children}
    </div>
  );
}
