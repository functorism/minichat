export const Tooltip = ({
  tooltip,
  children,
}: {
  tooltip: string;
  children: React.ReactNode;
}) => (
  <span className="relative group/tooltip">
    {children}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-max text-sm transition-opacity opacity-0 group-hover/tooltip:opacity-100 select-none">
      {tooltip}
    </span>
  </span>
);
