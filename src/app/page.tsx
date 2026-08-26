import { getDashboardData } from "@/lib/aggregate";
import { getStaffDashboard } from "@/lib/staff";
import Hero from "@/components/Hero";
import QuickEntry from "@/components/QuickEntry";
import KpiCards from "@/components/KpiCards";
import CaChart from "@/components/CaChart";
import ChargesDonut from "@/components/ChargesDonut";
import ExpensesHistogram, { RecentExpenses } from "@/components/ExpensesHistogram";
import PersonnelCard from "@/components/PersonnelCard";
import StaffAttendance from "@/components/StaffAttendance";
import NetResultChart from "@/components/NetResultChart";
import PannesCard from "@/components/PannesCard";
import MoMCard from "@/components/MoMCard";
import RecapTable from "@/components/RecapTable";
import Journal from "@/components/Journal";
import BilanCard from "@/components/BilanCard";
import ObjectifsCard from "@/components/ObjectifsCard";
import SettingsSection from "@/components/SettingsSection";
import Footer, { Cta } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, staffData] = await Promise.all([getDashboardData(), getStaffDashboard()]);
  const totalCharges = data.charges.op + data.charges.prelev + data.charges.pannes;
  const prelevShare = totalCharges > 0 ? (data.charges.prelev / totalCharges) * 100 : 0;

  return (
    <>
      <main>
        <Hero />
        <QuickEntry staffTotal={data.settings.staffTotal} />

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mt-8">
            <KpiCards kpi={data.kpi} spark={data.spark} prelevShare={prelevShare} ratePct={data.settings.ratePct} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <CaChart series={data.caSeries} />
            <ChargesDonut charges={data.charges} ratePct={data.settings.ratePct} />
          </div>

          <RecapTable daily={data.daily} weekly={data.weekly} monthly={data.monthly} ratePct={data.settings.ratePct} />
          <Journal entries={data.journal} />
        </section>

        <section id="charges" className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6">
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ExpensesHistogram data={data.expensesByMonth} />
            <RecentExpenses recent={data.recent} />
          </div>
        </section>

        <StaffAttendance data={staffData} />

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PersonnelCard data={data.personnel} />
            <NetResultChart data={data.netByMonth} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PannesCard stats={data.pannesStats} />
            <MoMCard mom={data.mom} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
            <div id="bilan" className="scroll-mt-24">
              <BilanCard bilans={data.bilans} dailyByMonth={data.dailyByMonth} ratePct={data.settings.ratePct} />
            </div>
            <div id="objectifs" className="scroll-mt-24">
              <ObjectifsCard objectifs={data.objectifs} />
            </div>
          </div>
        </section>

        <SettingsSection settings={data.settings} objective={data.objectifs.objective} />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
