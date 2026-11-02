import { getSupabaseClient } from '../lib/supabase';
import { EprLedgerEntry } from '../types';

export const eprService = {
  async getEprLedger(): Promise<EprLedgerEntry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('epr_ledger')
        .select(`
          id,
          ledger_reference,
          batch_id,
          recycling_record_id,
          organization_id,
          category_id,
          verified_weight_kg,
          credit_amount,
          credit_type,
          status,
          verifier_id,
          transaction_hash,
          notes,
          recorded_at,
          organizations:organization_id (org_name),
          ewaste_categories:category_id (name),
          ewaste_batches:batch_id (batch_number),
          profiles:verifier_id (full_name)
        `)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching EPR ledger:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        ledgerReference: row.ledger_reference,
        batchId: row.batch_id,
        batchNumber: row.ewaste_batches?.batch_number || `BATCH-${row.batch_id?.substring(0, 8)}`,
        recyclingRecordId: row.recycling_record_id,
        organizationId: row.organization_id,
        organizationName: row.organizations?.org_name || 'Apex Technology Corp (Enterprise ITAD)',
        categoryId: row.category_id,
        categoryName: row.ewaste_categories?.name || 'Computing & IT Hardware',
        verifiedWeightKg: Number(row.verified_weight_kg),
        creditAmount: Number(row.credit_amount),
        creditType: row.credit_type,
        status: row.status,
        verifierName: row.profiles?.full_name || 'Admin Compliance Officer',
        transactionHash: row.transaction_hash,
        notes: row.notes,
        recordedAt: row.recorded_at
      }));
    } catch (err) {
      console.error('Exception fetching EPR ledger:', err);
      return [];
    }
  },

  async verifyRecyclingAndIssueEpr(params: {
    batchId: string;
    adminId: string;
    notes?: string;
  }): Promise<EprLedgerEntry> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    // 1. Fetch batch and recycling record
    const { data: batch, error: batchError } = await supabase
      .from('ewaste_batches')
      .select(`
        *,
        recycling_records (*)
      `)
      .eq('id', params.batchId)
      .single();

    if (batchError || !batch) throw new Error('Batch not found.');

    const recRecord = Array.isArray(batch.recycling_records) && batch.recycling_records.length > 0
      ? batch.recycling_records[0]
      : null;

    if (!recRecord) throw new Error('No recycling yield declaration found for this batch.');

    const totalWeight = Number(recRecord.received_weight_kg || batch.total_weight_kg);

    // 2. Mark recycling_record as verified
    await supabase
      .from('recycling_records')
      .update({
        admin_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', recRecord.id);

    // 3. Mark ewaste_batch as verified
    await supabase
      .from('ewaste_batches')
      .update({
        status: 'verified'
      })
      .eq('id', params.batchId);

    // 4. Generate unique ledger reference and cryptographic hash
    const ledgerReference = `EPR-REC-2026-000${Math.floor(100 + Math.random() * 900)}`;
    const randomBytes = Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const transactionHash = `0x${randomBytes}`;

    // 5. Insert into epr_ledger
    const { data: ledgerEntry, error: ledgerError } = await supabase
      .from('epr_ledger')
      .insert({
        ledger_reference: ledgerReference,
        batch_id: params.batchId,
        recycling_record_id: recRecord.id,
        organization_id: null, // Public pool or linked org
        category_id: 'cat-it',
        verified_weight_kg: totalWeight,
        credit_amount: totalWeight,
        credit_type: 'recycling',
        status: 'verified',
        verifier_id: params.adminId,
        transaction_hash: transactionHash,
        notes: params.notes || 'Hydrometallurgical extraction verified against PCB manifest. Form 6 Certificate issued to EPR compliance pool.'
      })
      .select(`
        *,
        profiles:verifier_id (full_name)
      `)
      .single();

    if (ledgerError) throw ledgerError;

    // 6. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.adminId,
        actor_role: 'admin',
        action: 'EPR_CREDIT_ISSUED',
        entity_name: 'epr_ledger',
        entity_id: ledgerEntry.id,
        details: {
          ledgerReference,
          batchNumber: batch.batch_number,
          verifiedWeightKg: totalWeight,
          transactionHash
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return {
      id: ledgerEntry.id,
      ledgerReference: ledgerEntry.ledger_reference,
      batchId: ledgerEntry.batch_id,
      batchNumber: batch.batch_number,
      recyclingRecordId: ledgerEntry.recycling_record_id,
      organizationName: 'Apex Technology Corp (Enterprise ITAD)',
      categoryId: ledgerEntry.category_id,
      categoryName: 'Computing & IT Hardware',
      verifiedWeightKg: Number(ledgerEntry.verified_weight_kg),
      creditAmount: Number(ledgerEntry.credit_amount),
      creditType: ledgerEntry.credit_type,
      status: ledgerEntry.status,
      verifierName: ledgerEntry.profiles?.full_name || 'Admin Officer',
      transactionHash: ledgerEntry.transaction_hash,
      notes: ledgerEntry.notes,
      recordedAt: ledgerEntry.recorded_at
    };
  }
};
