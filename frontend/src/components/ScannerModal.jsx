import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const ScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Scan Barcode",
}) => {
  useEffect(() => {
    let scanner = null;

    if (isOpen) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 450, height: 260 },
            aspectRatio: 1.333333,
            showTorchButtonIfSupported: true,
          },
          false,
        );

        scanner.render(
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (error) => {},
        );
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          const file = new File([blob], "paste.png", { type: blob.type });

          const tempScanner = new Html5Qrcode("reader-hidden");
          tempScanner
            .scanFile(file, true)
            .then((decodedText) => {
              onScanSuccess(decodedText);
            })
            .catch((err) => {
              console.error("Paste scan failed", err);
              alert("Could not decode barcode from pasted image.");
            });
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e2329] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#252a33]">
          <h3 className="font-bold text-white flex items-center gap-2 text-lg">
            <span className="material-symbols-outlined text-primary text-2xl">
              barcode_reader
            </span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-0 bg-black relative">
          <div
            id="reader"
            className="w-full text-white [&>div]:!shadow-none [&_select]:!text-black"
          ></div>
          <div
            id="reader-hidden"
            className="hidden"
          ></div>
        </div>

        <div className="p-4 text-center bg-[#252a33] border-t border-slate-700">
          <p className="text-slate-300 font-medium text-sm mb-1">
            Point camera at the barcode
          </p>
          <p className="text-slate-500 text-xs">
            Or press{" "}
            <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white font-mono">
              Ctrl+V
            </kbd>{" "}
            to paste an image
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
