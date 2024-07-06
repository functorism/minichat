export const Indicator = ({ value, name }: { name: string; value: number }) => {
  return (
    <span>
      {name} <sup>{value}</sup>
    </span>
  );
};
