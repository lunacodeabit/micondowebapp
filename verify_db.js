
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kttrzritomsfnqfwiplv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dHJ6cml0b21zZm5xZndpcGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDEwMDcsImV4cCI6MjA4NzE3NzAwN30.KtXcoW5XWN-erBrMRTtCgJ96AG6Rxjounkciab8q7No';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('--- STARTING VERIFICATION ---');

    // 1. Check Companies
    console.log('\nChecking Companies...');
    const { data: companies, error: compError } = await supabase.from('companies').select('id, name').limit(1);
    if (compError) {
        console.error('Error fetching companies:', compError);
        return;
    }
    if (!companies || companies.length === 0) {
        console.log('No companies found.');
        return;
    }
    const targetCompany = companies[0];
    console.log(`Found Company: ${targetCompany.name} (${targetCompany.id})`);

    // 2. Check Condos (ViewClientsModal logic)
    console.log('\nChecking Condos (company_id lookup)...');
    const { data: condos, error: condoError } = await supabase
        .from('condos')
        .select('id, name, company_id')
        .eq('company_id', targetCompany.id);

    if (condoError) {
        console.error('Error fetching condos:', condoError);
    } else {
        console.log(`Found ${condos.length} condos linked to this company.`);
        if (condos.length > 0) {
            console.log(`Success: ViewClientsModal logic (company_id lookup) is valid.`);
        }
    }

    // 3. Check saas_payments schema (BillingDetailModal logic)
    console.log('\nChecking saas_payments schema...');
    // We try to select one record to see keys
    const { data: payments, error: payError } = await supabase.from('saas_payments').select('*').limit(1);
    if (payError) {
        console.error('Error fetching payments:', payError);
    } else if (payments && payments.length > 0) {
        console.log('Payment record found. Keys:');
        console.log(Object.keys(payments[0]));

        const hasSnakeCase = Object.keys(payments[0]).some(k => k.includes('_'));
        console.log(`Contains snake_case keys: ${hasSnakeCase}`);
    } else {
        console.log('No payments found in DB to check keys. Trying dummy insert with snake_case...');

        const dummyPayment = {
            company_id: targetCompany.id,
            company_name: targetCompany.name,
            amount: 100,
            payment_date: new Date().toISOString().split('T')[0],
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            method: 'Otro',
            reference: 'VERIFY-TEST',
            created_at: new Date().toISOString()
        };

        const { data: insertData, error: insertError } = await supabase.from('saas_payments').insert(dummyPayment).select();
        if (insertError) {
            console.error('Insert with snake_case FAILED:', insertError);
        } else {
            console.log('Insert with snake_case SUCCESSFUL.');
            // Clean up
            const { error: deleteError } = await supabase.from('saas_payments').delete().eq('reference', 'VERIFY-TEST');
            if (deleteError) console.error('Cleanup failed:', deleteError);
            else console.log('Cleanup successful.');
        }
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verify();
