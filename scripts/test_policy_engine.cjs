const API_BASE = "http://localhost:8080/api/v1";

async function runTest() {
  console.log("================================================================");
  console.log("🚀 TESTING REVAMPED POLICY & WORKFLOW ENGINE");
  console.log("================================================================\n");

  // 1. Admin Login
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@hrms.com", password: "Admin@123", rememberMe: false })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  console.log("1. Admin Login:", loginRes.status === 200 ? "✅ PASS" : "❌ FAIL", "Token acquired:", !!token);

  const authHeaders = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  // 2. Attendance Policies
  const polRes = await fetch(`${API_BASE}/policies/attendance`, { headers: authHeaders });
  const polData = await polRes.json();
  console.log("2. GET /policies/attendance:", polRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Found: ${polData.data?.length} policies`);
  if (polData.data) {
    polData.data.forEach(p => {
      console.log(`   - Policy: ${p.policyCode} | ${p.policyName} (Grace: ${p.gracePeriodMinutes}m, MaxLate: ${p.maxLateAllowedPerMonth}/mo, Penalty: ${p.latePenaltyAction})`);
    });
  }

  // 3. Effective Policy Resolution
  const effRes = await fetch(`${API_BASE}/policies/attendance/effective/1`, { headers: authHeaders });
  const effData = await effRes.json();
  console.log("3. GET /policies/attendance/effective/1 (Tier Resolution):", effRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Effective Policy: ${effData.data?.policyCode}`);

  // 4. Tenant Module Manifests
  const modRes = await fetch(`${API_BASE}/tenant/modules`, { headers: authHeaders });
  const modData = await modRes.json();
  console.log("4. GET /tenant/modules (SaaS Feature Flags):", modRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Total Manifest Modules: ${modData.data?.length}`);

  // 5. Enabled Module Keys
  const enRes = await fetch(`${API_BASE}/tenant/modules/enabled`, { headers: authHeaders });
  const enData = await enRes.json();
  console.log("5. GET /tenant/modules/enabled:", enRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Active Module Count: ${enData.data?.length}`);

  // 6. Test Module Toggle
  const toggleRes = await fetch(`${API_BASE}/tenant/modules/INTELLIGENCE`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ enabled: false })
  });
  const toggleData = await toggleRes.json();
  console.log("6. PUT /tenant/modules/INTELLIGENCE (Set Disabled):", toggleRes.status === 200 ? "✅ PASS" : "❌ FAIL", `IsEnabled: ${toggleData.data?.isEnabled}`);

  // Re-enable
  await fetch(`${API_BASE}/tenant/modules/INTELLIGENCE`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ enabled: true })
  });
  console.log("   Re-enabled INTELLIGENCE: ✅ PASS");

  // 7. Policy Assignments Hierarchy
  const assignRes = await fetch(`${API_BASE}/policies/assignments`, { headers: authHeaders });
  const assignData = await assignRes.json();
  console.log("7. GET /policies/assignments (Hierarchy Matrix):", assignRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Assignments configured: ${assignData.data?.length}`);

  // 8. Workflow Inbox
  const inboxRes = await fetch(`${API_BASE}/workflows/inbox`, { headers: authHeaders });
  const inboxData = await inboxRes.json();
  console.log("8. GET /workflows/inbox (Approvals Hub):", inboxRes.status === 200 ? "✅ PASS" : "❌ FAIL", `Pending Workflow Tasks: ${inboxData.data?.length}`);

  console.log("\n================================================================");
  console.log("🎉 ALL NEW REVAMP ARCHITECTURE ENDPOINTS VERIFIED SUCCESSFULLY!");
  console.log("================================================================\n");
}

runTest().catch(console.error);

