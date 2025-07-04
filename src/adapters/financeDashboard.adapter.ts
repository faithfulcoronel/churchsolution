import "reflect-metadata";
import { injectable } from "inversify";
import { supabase } from "../lib/supabase";
import { tenantUtils } from "../utils/tenantUtils";
import { format } from "date-fns";

@injectable()
export class FinanceDashboardAdapter {
  async fetchMonthlyTrends(startDate?: Date, endDate?: Date) {
    let query = supabase.from("finance_monthly_trends").select("*");

    if (startDate) {
      query = query.gte("month", format(startDate, "yyyy-MM"));
    }

    if (endDate) {
      query = query.lte("month", format(endDate, "yyyy-MM"));
    }

    const { data, error } = await query.order("month");
    if (error) throw error;
    return data || [];
  }

  async fetchMonthlyStats(startDate: Date, endDate: Date) {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase.rpc("finance_monthly_stats", {
      p_tenant_id: tenantId,
      p_start_date: format(startDate, "yyyy-MM-dd"),
      p_end_date: format(endDate, "yyyy-MM-dd"),
    });
    if (error) throw error;
    return data?.[0] || null;
  }

  async fetchFundBalances() {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("fund_balances_view")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data || [];
  }

  async fetchSourceBalances() {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return [];

    const { data: sources, error: srcErr } = await supabase
      .from("financial_sources")
      .select("id, name, account_id")
      .eq("tenant_id", tenantId)
      .order("name");
    if (srcErr) throw srcErr;

    const { data: trial, error: trialErr } = await supabase.rpc(
      "report_trial_balance",
      { p_tenant_id: tenantId, p_end_date: format(new Date(), "yyyy-MM-dd") },
    );
    if (trialErr) throw trialErr;

    const balanceMap = new Map(
      (trial || []).map((t: any) => [
        t.account_id,
        Number(t.debit_balance) - Number(t.credit_balance),
      ]),
    );

    return (sources || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      balance: balanceMap.get(s.account_id) || 0,
    }));
  }
}

export interface IFinanceDashboardAdapter extends FinanceDashboardAdapter {}
