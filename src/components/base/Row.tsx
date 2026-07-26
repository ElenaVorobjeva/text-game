type Props = {
  children: React.ReactNode;
};

export function Row({ children }: Props) {
  return (
    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
      {children}
    </div>
  );
}
