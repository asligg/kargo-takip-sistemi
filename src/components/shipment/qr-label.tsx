"use client";

import { Leaf, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

export interface LabelData {
  trackingNo: string;
  senderName: string;
  senderCity: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverPhone: string;
  originBranch: string;
  destBranch: string;
  weight: string;
}

/** Yazdırılabilir kargo etiketi; QR kod takip numarasını içerir (FR-06) */
export function QrLabel({ data }: { data: LabelData }) {
  return (
    <div>
      <div id="kargo-etiketi" className="mx-auto max-w-md rounded-lg border-2 border-dashed border-slate-400 bg-white p-5 print:border-solid">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-brand-700">
            <Leaf size={18} aria-hidden /> Yeşil Kargo
          </span>
          <span className="text-xs text-slate-500">{data.weight}</span>
        </div>
        <div className="flex gap-4 py-4">
          <QRCodeSVG value={data.trackingNo} size={116} level="M" marginSize={0} aria-label={`QR kod: ${data.trackingNo}`} />
          <div className="min-w-0 text-sm">
            <p className="text-xs uppercase text-slate-500">Alıcı</p>
            <p className="font-semibold text-slate-900">{data.receiverName}</p>
            <p className="text-slate-700">{data.receiverAddress}</p>
            <p className="text-slate-700">{data.receiverCity}</p>
            <p className="text-slate-700">{data.receiverPhone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs">
          <div>
            <p className="text-slate-500">Gönderici</p>
            <p className="font-medium text-slate-800">
              {data.senderName} · {data.senderCity}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Çıkış → Varış</p>
            <p className="font-medium text-slate-800">
              {data.originBranch} → {data.destBranch}
            </p>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-xl font-bold tracking-[0.2em] text-slate-900">{data.trackingNo}</p>
      </div>
      <div className="mt-4 flex justify-center print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} aria-hidden /> Etiketi Yazdır
        </Button>
      </div>
    </div>
  );
}
