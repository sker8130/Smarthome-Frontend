"use client";

export default function Loader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="loader-boxes">
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="box">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <p className="text-sm text-white/80 mt-20">"Verifying login session..."</p>
    </div>
  );
}
