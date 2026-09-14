export default function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-neutral-900" />
    </div>
  );
}
