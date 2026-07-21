export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full border-2 border-fuchsia shadow-[0_0_30px_#ff1493]" />
        <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-silver">
          Loading glam…
        </p>
      </div>
    </div>
  );
}
