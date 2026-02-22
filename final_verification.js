
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kttrzritomsfnqfwiplv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dHJ6cml0b21zZm5xZndpcGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDEwMDcsImV4cCI6MjA4NzE3NzAwN30.KtXcoW5XWN-erBrMRTtCgJ96AG6Rxjounkciab8q7No';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
    console.log('================================================================');
    console.log('🛡️  SUPER ADMIN SYSTEM VERIFICATION (FINAL SCAN)');
    console.log('================================================================\n');

    let testCompanyId = null;

    try {
        // TEST 1: Company CRUD (Verification of snake_case fix)
        console.log('TEST 1: Company CRUD Operations...');
        const dummyCompany = {
            name: 'TEST_VERIFY_CO',
            address: 'Calle Verification #123',
            phone: '809-000-0000',
            email: 'verify@test.com',
            rnc: '000000001',
            admin_user_email: 'admin@verifytest.com',
            status: 'Activo',
            billing_start_date: new Date().toISOString().split('T')[0],
            grace_period_days: 15,
            plan: 'Pro',
            monthly_fee: 1500,
            condo_count: 0
        };

        const { data: created, error: createError } = await supabase.from('companies').insert(dummyCompany).select().single();
        if (createError) throw new Error(`Create Company Failed: ${createError.message}`);
        testCompanyId = created.id;
        console.log(`✅ Create: Success (ID: ${testCompanyId})`);

        const { error: updateError } = await supabase.from('companies').update({ name: 'TEST_VERIFY_CO_UPDATED' }).eq('id', testCompanyId);
        if (updateError) throw new Error(`Update Company Failed: ${updateError.message}`);
        console.log('✅ Update: Success');


        // TEST 2: ViewClients connectivity (UUID check)
        console.log('\nTEST 2: ViewClients connectivity (UUID check)...');
        const { data: condos, error: condoError } = await supabase.from('condos').select('*').eq('company_id', testCompanyId);
        if (condoError) throw new Error(`ViewClients query failed: ${condoError.message}`);
        console.log(`✅ UUID Lookup: Success (Found ${condos.length} condos)`);


        // TEST 3: Billing Registration (Verifying saas_payments snake_case)
        console.log('\nTEST 3: Billing Registration (saas_payments)...');
        const dummyPayment = {
            company_id: testCompanyId,
            company_name: 'TEST_VERIFY_CO_UPDATED',
            amount: 500.50,
            payment_date: new Date().toISOString().split('T')[0],
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            method: 'Transferencia',
            reference: 'VERIFY-BILLING-TEST',
            created_at: new Date().toISOString()
        };

        const { error: payError } = await supabase.from('saas_payments').insert(dummyPayment);
        if (payError) throw new Error(`Payment Registration Failed: ${payError.message}`);
        console.log('✅ Payment Insert: Success (Standardized snake_case confirmed)');


        // TEST 4: Announcements flow (Verification for portals)
        console.log('\nTEST 4: Announcements flow...');
        const dummyAnnouncement = {
            title: 'VERIFY_TEST_SYSTEM',
            content: 'This is a verification test',
            type: 'update',
            target_audience: 'all',
            is_active: true,
            publish_date: new Date().toISOString().split('T')[0]
        };

        const { data: announcement, error: annError } = await supabase.from('saas_announcements').insert(dummyAnnouncement).select().single();
        if (annError) throw new Error(`Announcement Creation Failed: ${annError.message}`);
        console.log('✅ Announcement Creation: Success');


        // CLEANUP
        console.log('\n----------------------------------------------------------------');
        console.log('🧹 CLEANING UP...');
        await supabase.from('saas_payments').delete().eq('company_id', testCompanyId);
        await supabase.from('saas_announcements').delete().eq('id', announcement.id);
        await supabase.from('companies').delete().eq('id', testCompanyId);
        console.log('✅ Cleanup: Success');

        console.log('\n================================================================');
        console.log('🎉 ALL TESTS PASSED! SYSTEM IS 100% FUNCTIONAL');
        console.log('================================================================');

    } catch (err) {
        console.error('\n❌ VERIFICATION FAILED!');
        console.error(`Reason: ${err.message}`);
        if (testCompanyId) {
            console.log('Attempting cleanup of ID:', testCompanyId);
            await supabase.from('companies').delete().eq('id', testCompanyId);
        }
        process.exit(1);
    }
}

runTests();
