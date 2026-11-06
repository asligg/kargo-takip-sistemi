import type { Metadata } from "next";
import { AssignCourierForm } from "@/components/forms/assign-courier-form";
import { PageHeader } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listBranchShipments, listCourierShipments, listUsers } from "@/lib/data";
import { PREF_SHORT } from "@/lib/delivery-pref";
import { formatDayLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Kuryeye Gönderi Ata" };

/** Kurye atama (FR-13) */
export default async function AssignPage() {
  const user = await requireRole("sube");
  const { awaitingAssign } = listBranchShipments(user.branchId!);
  const couriers = listUsers("kurye")
    .filter((k) => k.branchId === user.branchId && k.active)
    .map((k) => ({ id: k.id, name: k.name, active: listCourierShipments(k.id).filter((s) => s.status === "DAGITIMDA").length }));

  return (
    <>
      <PageHeader
        title="Kuryeye Gönderi Ata"
        description="Gönderileri seçip kuryeye atayın. Atama sonrası gönderi 'Dağıtımda' olur ve alıcıya 6 haneli teslimat doğrulama kodu gönderilir. İleri tarih veya yeşil gün seçen alıcıların gönderilerini o gün atayın; yeşil gündeki gönderileri aynı kuryeye toplu atamak son kilometre salımını azaltır."
      />
      <AssignCourierForm
        couriers={couriers}
        rows={awaitingAssign.map((s) => ({
          trackingNo: s.trackingNo,
          receiver: s.receiver.name,
          district: s.receiver.district,
          status: s.status,
          pref: s.deliveryPref && {
            label: PREF_SHORT[s.deliveryPref.option],
            detail: s.deliveryPref.date ? formatDayLabel(s.deliveryPref.date) : s.deliveryPref.neighbor,
            green: s.deliveryPref.option === "YESIL_GUN",
          },
        }))}
      />
    </>
  );
}
