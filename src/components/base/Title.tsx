type Props = {
  children: React.ReactNode;
  as?: React.ElementType;
  classes?: string;
};
export function Title({ children, as: Tag = "h1", classes }: Props) {
  return (
    <Tag className={`text-light-blue text-lg font-bold ${classes}`}>
      {children}
    </Tag>
  );
}
