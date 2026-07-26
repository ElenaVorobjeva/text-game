type Props = {
  children: React.ReactNode;
  as?: React.ElementType;
  classes?: string;
};
export function Heading({ children, as: Tag = "h1", classes }: Props) {
  return (
    <Tag
      className={`font-heading text-light-blue text-xl leading-tight ${classes}`}
    >
      {children}
    </Tag>
  );
}
