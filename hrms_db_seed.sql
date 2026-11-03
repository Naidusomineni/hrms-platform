--
-- PostgreSQL database dump
--

\restrict 2CsaETyoQyGVFI479KwaIV9zNF2RzaC3XxqQ27c5lMX4HkBT9OrLJd8pYWfD173

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS workflow_steps_workflow_definition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_instances DROP CONSTRAINT IF EXISTS workflow_instances_workflow_definition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_instances DROP CONSTRAINT IF EXISTS workflow_instances_initiated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_approvals DROP CONSTRAINT IF EXISTS workflow_approvals_workflow_instance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_approvals DROP CONSTRAINT IF EXISTS workflow_approvals_approver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_ticket_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tenant_subscriptions DROP CONSTRAINT IF EXISTS tenant_subscriptions_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tenant_settings DROP CONSTRAINT IF EXISTS tenant_settings_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tax_declarations DROP CONSTRAINT IF EXISTS tax_declarations_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_target_roster_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_target_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_reviewed_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_requester_roster_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_requester_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.separation_clearances DROP CONSTRAINT IF EXISTS separation_clearances_separation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roster_assignments DROP CONSTRAINT IF EXISTS roster_assignments_shift_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roster_assignments DROP CONSTRAINT IF EXISTS roster_assignments_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roster_assignments DROP CONSTRAINT IF EXISTS roster_assignments_assigned_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.policy_acknowledgements DROP CONSTRAINT IF EXISTS policy_acknowledgements_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.policy_acknowledgements DROP CONSTRAINT IF EXISTS policy_acknowledgements_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_job_posting_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_interviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_candidate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_scorecards DROP CONSTRAINT IF EXISTS interview_scorecards_interviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_scorecards DROP CONSTRAINT IF EXISTS interview_scorecards_interview_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interview_scorecards DROP CONSTRAINT IF EXISTS interview_scorecards_candidate_id_fkey;
ALTER TABLE IF EXISTS ONLY public.full_and_final_settlements DROP CONSTRAINT IF EXISTS full_and_final_settlements_separation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.full_and_final_settlements DROP CONSTRAINT IF EXISTS full_and_final_settlements_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flight_risk_evaluations DROP CONSTRAINT IF EXISTS flight_risk_evaluations_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS fkrxff2xg1kffbjfh5maxwoqyhw;
ALTER TABLE IF EXISTS ONLY public.payroll_slips DROP CONSTRAINT IF EXISTS fkpoicqcn7c9rfhevvpcmp26lkf;
ALTER TABLE IF EXISTS ONLY public.candidates DROP CONSTRAINT IF EXISTS fkoe0856gvdr227x6x9f5n8eh4n;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS fkm6br6lc65loui2q8s547hqyv7;
ALTER TABLE IF EXISTS ONLY public.job_postings DROP CONSTRAINT IF EXISTS fklf5mdg8kjkvp8cpmvb1u4kypc;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS fki4365uo9af35g7jtbc2rteukt;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS fkgy4qe3dnqrm3ktd76sxp7n4c2;
ALTER TABLE IF EXISTS ONLY public.job_postings DROP CONSTRAINT IF EXISTS fke3uny7fq6xryh69fn229xckaf;
ALTER TABLE IF EXISTS ONLY public.interview_scorecards DROP CONSTRAINT IF EXISTS fkd1rjgtcf63yap70y0s5810iec;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS fkb48lmkou5j4rvde9sr88bqgjw;
ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS fk_ws_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_instances DROP CONSTRAINT IF EXISTS fk_wi_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_definitions DROP CONSTRAINT IF EXISTS fk_wd_tenant;
ALTER TABLE IF EXISTS ONLY public.workflow_approvals DROP CONSTRAINT IF EXISTS fk_wa_tenant;
ALTER TABLE IF EXISTS ONLY public.policy_acknowledgements DROP CONSTRAINT IF EXISTS fk_pa_tenant;
ALTER TABLE IF EXISTS ONLY public.office_locations DROP CONSTRAINT IF EXISTS fk_ol_tenant;
ALTER TABLE IF EXISTS ONLY public.leave_policies DROP CONSTRAINT IF EXISTS fk_lp_tenant;
ALTER TABLE IF EXISTS ONLY public.expense_claims DROP CONSTRAINT IF EXISTS fk_exp_slip;
ALTER TABLE IF EXISTS ONLY public.expense_claims DROP CONSTRAINT IF EXISTS fk_exp_mgr;
ALTER TABLE IF EXISTS ONLY public.expense_claims DROP CONSTRAINT IF EXISTS fk_exp_fin;
ALTER TABLE IF EXISTS ONLY public.expense_claims DROP CONSTRAINT IF EXISTS fk_exp_emp;
ALTER TABLE IF EXISTS ONLY public.employee_requests DROP CONSTRAINT IF EXISTS fk_er_tenant;
ALTER TABLE IF EXISTS ONLY public.employee_leave_balances DROP CONSTRAINT IF EXISTS fk_elb_tenant;
ALTER TABLE IF EXISTS ONLY public.employee_documents DROP CONSTRAINT IF EXISTS fk_ed_tenant;
ALTER TABLE IF EXISTS ONLY public.attendance_regularizations DROP CONSTRAINT IF EXISTS fk_att_reg_tenant;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk9y21adhxn0ayjhfocscqox7bh;
ALTER TABLE IF EXISTS ONLY public.candidates DROP CONSTRAINT IF EXISTS fk7rt9091ioibhg96nw18g78w87;
ALTER TABLE IF EXISTS ONLY public.performance_reviews DROP CONSTRAINT IF EXISTS fk75f19q3rvitsw5bl5o3k0lirt;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS fk69x3vjuy1t5p18a5llb8h2fjx;
ALTER TABLE IF EXISTS ONLY public.performance_reviews DROP CONSTRAINT IF EXISTS fk57bxpu5rccy6vvcqolbnbqal0;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS fk56q3esufky8u69xbmo4n63c4r;
ALTER TABLE IF EXISTS ONLY public.login_history DROP CONSTRAINT IF EXISTS fk20v0mimmdegh2afs39uixlxpm;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS fk1lih5y2npsf8u5o3vhdb9y0os;
ALTER TABLE IF EXISTS ONLY public.employee_separations DROP CONSTRAINT IF EXISTS employee_separations_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_separations DROP CONSTRAINT IF EXISTS employee_separations_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_requests DROP CONSTRAINT IF EXISTS employee_requests_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_requests DROP CONSTRAINT IF EXISTS employee_requests_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_leave_balances DROP CONSTRAINT IF EXISTS employee_leave_balances_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_goals DROP CONSTRAINT IF EXISTS employee_goals_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_goals DROP CONSTRAINT IF EXISTS employee_goals_cycle_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_documents DROP CONSTRAINT IF EXISTS employee_documents_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_documents DROP CONSTRAINT IF EXISTS employee_documents_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_announcements DROP CONSTRAINT IF EXISTS company_announcements_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.company_announcements DROP CONSTRAINT IF EXISTS company_announcements_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_regularizations DROP CONSTRAINT IF EXISTS attendance_regularizations_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_regularizations DROP CONSTRAINT IF EXISTS attendance_regularizations_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_regularizations DROP CONSTRAINT IF EXISTS attendance_regularizations_attendance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_office_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asset_allocations DROP CONSTRAINT IF EXISTS asset_allocations_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asset_allocations DROP CONSTRAINT IF EXISTS asset_allocations_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcement_acknowledgments DROP CONSTRAINT IF EXISTS announcement_acknowledgments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcement_acknowledgments DROP CONSTRAINT IF EXISTS announcement_acknowledgments_announcement_id_fkey;
DROP INDEX IF EXISTS public.uk_exp_claim_number;
DROP INDEX IF EXISTS public.idx_wi_tenant_ent;
DROP INDEX IF EXISTS public.idx_wi_status;
DROP INDEX IF EXISTS public.idx_wd_tenant_mod;
DROP INDEX IF EXISTS public.idx_wa_instance;
DROP INDEX IF EXISTS public.idx_users_tenant_email;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_ticket_comments_ticket;
DROP INDEX IF EXISTS public.idx_tax_declarations_tenant;
DROP INDEX IF EXISTS public.idx_swap_tenant_status;
DROP INDEX IF EXISTS public.idx_swap_target;
DROP INDEX IF EXISTS public.idx_swap_requester;
DROP INDEX IF EXISTS public.idx_support_tickets_tenant_status;
DROP INDEX IF EXISTS public.idx_support_tickets_emp;
DROP INDEX IF EXISTS public.idx_support_tickets_assigned;
DROP INDEX IF EXISTS public.idx_shifts_tenant;
DROP INDEX IF EXISTS public.idx_separation_clearances_sep;
DROP INDEX IF EXISTS public.idx_rt_user;
DROP INDEX IF EXISTS public.idx_rt_token;
DROP INDEX IF EXISTS public.idx_rt_expiry;
DROP INDEX IF EXISTS public.idx_roster_tenant_date;
DROP INDEX IF EXISTS public.idx_roster_emp_date;
DROP INDEX IF EXISTS public.idx_roles_tenant;
DROP INDEX IF EXISTS public.idx_pr_emp;
DROP INDEX IF EXISTS public.idx_pr_cycle;
DROP INDEX IF EXISTS public.idx_payroll_tenant_period;
DROP INDEX IF EXISTS public.idx_payroll_period;
DROP INDEX IF EXISTS public.idx_payroll_emp;
DROP INDEX IF EXISTS public.idx_ol_tenant;
DROP INDEX IF EXISTS public.idx_notif_user_read;
DROP INDEX IF EXISTS public.idx_notif_time;
DROP INDEX IF EXISTS public.idx_notif_tenant_user;
DROP INDEX IF EXISTS public.idx_lr_emp_status;
DROP INDEX IF EXISTS public.idx_lr_dates;
DROP INDEX IF EXISTS public.idx_lp_tenant;
DROP INDEX IF EXISTS public.idx_lh_user_time;
DROP INDEX IF EXISTS public.idx_lh_status;
DROP INDEX IF EXISTS public.idx_leaves_tenant_emp;
DROP INDEX IF EXISTS public.idx_jp_status;
DROP INDEX IF EXISTS public.idx_jp_dept;
DROP INDEX IF EXISTS public.idx_job_openings_tenant;
DROP INDEX IF EXISTS public.idx_interview_sessions_tenant;
DROP INDEX IF EXISTS public.idx_interview_sessions_interviewer;
DROP INDEX IF EXISTS public.idx_interview_sessions_guest_token;
DROP INDEX IF EXISTS public.idx_interview_sessions_candidate;
DROP INDEX IF EXISTS public.idx_interview_scorecards_tenant;
DROP INDEX IF EXISTS public.idx_hr_policy_tenant_cat;
DROP INDEX IF EXISTS public.idx_hr_policy_tenant_active;
DROP INDEX IF EXISTS public.idx_fnf_settlements_tenant_emp;
DROP INDEX IF EXISTS public.idx_flight_risk_tenant_lvl;
DROP INDEX IF EXISTS public.idx_flight_risk_emp;
DROP INDEX IF EXISTS public.idx_exp_tenant_status;
DROP INDEX IF EXISTS public.idx_exp_tenant_emp;
DROP INDEX IF EXISTS public.idx_exp_date;
DROP INDEX IF EXISTS public.idx_er_tenant_emp;
DROP INDEX IF EXISTS public.idx_employee_separations_tenant_emp;
DROP INDEX IF EXISTS public.idx_employee_separations_status;
DROP INDEX IF EXISTS public.idx_employee_goals_tenant;
DROP INDEX IF EXISTS public.idx_emp_tenant_status;
DROP INDEX IF EXISTS public.idx_emp_tenant_number;
DROP INDEX IF EXISTS public.idx_emp_status;
DROP INDEX IF EXISTS public.idx_emp_number;
DROP INDEX IF EXISTS public.idx_emp_manager;
DROP INDEX IF EXISTS public.idx_emp_email;
DROP INDEX IF EXISTS public.idx_emp_dept;
DROP INDEX IF EXISTS public.idx_elb_tenant_emp;
DROP INDEX IF EXISTS public.idx_ed_expiry;
DROP INDEX IF EXISTS public.idx_ed_emp_cat;
DROP INDEX IF EXISTS public.idx_dept_tenant_code;
DROP INDEX IF EXISTS public.idx_cand_stage;
DROP INDEX IF EXISTS public.idx_cand_job;
DROP INDEX IF EXISTS public.idx_biometric_tenant;
DROP INDEX IF EXISTS public.idx_audit_tenant_time;
DROP INDEX IF EXISTS public.idx_att_tenant_emp_date;
DROP INDEX IF EXISTS public.idx_att_status;
DROP INDEX IF EXISTS public.idx_att_reg_tenant_emp;
DROP INDEX IF EXISTS public.idx_att_emp;
DROP INDEX IF EXISTS public.idx_att_date;
DROP INDEX IF EXISTS public.idx_assets_tenant;
DROP INDEX IF EXISTS public.idx_asset_allocations_tenant;
DROP INDEX IF EXISTS public.idx_appraisal_cycles_tenant;
DROP INDEX IF EXISTS public.idx_announcements_tenant_pub;
DROP INDEX IF EXISTS public.idx_announcements_pinned;
DROP INDEX IF EXISTS public.idx_al_user;
DROP INDEX IF EXISTS public.idx_al_time;
DROP INDEX IF EXISTS public.idx_al_entity;
ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS workflow_steps_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_instances DROP CONSTRAINT IF EXISTS workflow_instances_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_definitions DROP CONSTRAINT IF EXISTS workflow_definitions_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_approvals DROP CONSTRAINT IF EXISTS workflow_approvals_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.workflow_steps DROP CONSTRAINT IF EXISTS uk_ws_def_order;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uk_users_email;
ALTER TABLE IF EXISTS ONLY public.tenant_settings DROP CONSTRAINT IF EXISTS uk_tenant_setting;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS uk_tenant_role;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS uk_tenant_code;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS uk_shifts_tenant_code;
ALTER TABLE IF EXISTS ONLY public.roster_assignments DROP CONSTRAINT IF EXISTS uk_roster_emp_date;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS uk_permission_name;
ALTER TABLE IF EXISTS ONLY public.payroll_slips DROP CONSTRAINT IF EXISTS uk_payroll;
ALTER TABLE IF EXISTS ONLY public.policy_acknowledgements DROP CONSTRAINT IF EXISTS uk_pa_doc_emp;
ALTER TABLE IF EXISTS ONLY public.leave_policies DROP CONSTRAINT IF EXISTS uk_lp_tenant_type;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS uk_l7tivi5261wxdnvo6cct9gg6t;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS uk_j9xgmd0ya5jmus09o0b8pqrpb;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS uk_j6cwks7xecs5jov19ro8ge3qk;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS uk_j2dmgsma6pont6kf7nic9elpd;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS uk_ghpmfn23vmxfu3spu3lfg4r2d;
ALTER TABLE IF EXISTS ONLY public.employee_leave_balances DROP CONSTRAINT IF EXISTS uk_elb_emp_type_yr;
ALTER TABLE IF EXISTS ONLY public.biometric_devices DROP CONSTRAINT IF EXISTS uk_biometric_device;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS uk_att_emp_date;
ALTER TABLE IF EXISTS ONLY public.announcement_acknowledgments DROP CONSTRAINT IF EXISTS uk_announcement_user;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS uk_9aw59jtyajbpyr0q02h20ahql;
ALTER TABLE IF EXISTS ONLY public.ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_code_key;
ALTER TABLE IF EXISTS ONLY public.tenant_subscriptions DROP CONSTRAINT IF EXISTS tenant_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.tenant_settings DROP CONSTRAINT IF EXISTS tenant_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_declarations DROP CONSTRAINT IF EXISTS tax_declarations_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS shifts_pkey;
ALTER TABLE IF EXISTS ONLY public.shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swap_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.separation_clearances DROP CONSTRAINT IF EXISTS separation_clearances_pkey;
ALTER TABLE IF EXISTS ONLY public.roster_assignments DROP CONSTRAINT IF EXISTS roster_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.policy_acknowledgements DROP CONSTRAINT IF EXISTS policy_acknowledgements_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_key;
ALTER TABLE IF EXISTS ONLY public.performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.payroll_slips DROP CONSTRAINT IF EXISTS payroll_slips_pkey;
ALTER TABLE IF EXISTS ONLY public.office_locations DROP CONSTRAINT IF EXISTS office_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.login_history DROP CONSTRAINT IF EXISTS login_history_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_policies DROP CONSTRAINT IF EXISTS leave_policies_pkey;
ALTER TABLE IF EXISTS ONLY public.job_postings DROP CONSTRAINT IF EXISTS job_postings_pkey;
ALTER TABLE IF EXISTS ONLY public.job_openings DROP CONSTRAINT IF EXISTS job_openings_pkey;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_room_name_key;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.interview_sessions DROP CONSTRAINT IF EXISTS interview_sessions_guest_access_token_key;
ALTER TABLE IF EXISTS ONLY public.interview_scorecards DROP CONSTRAINT IF EXISTS interview_scorecards_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS idx_ss_key;
ALTER TABLE IF EXISTS ONLY public.hr_policy_articles DROP CONSTRAINT IF EXISTS hr_policy_articles_pkey;
ALTER TABLE IF EXISTS ONLY public.full_and_final_settlements DROP CONSTRAINT IF EXISTS full_and_final_settlements_pkey;
ALTER TABLE IF EXISTS ONLY public.flight_risk_evaluations DROP CONSTRAINT IF EXISTS flight_risk_evaluations_pkey;
ALTER TABLE IF EXISTS ONLY public.expense_claims DROP CONSTRAINT IF EXISTS expense_claims_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_separations DROP CONSTRAINT IF EXISTS employee_separations_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_requests DROP CONSTRAINT IF EXISTS employee_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_leave_balances DROP CONSTRAINT IF EXISTS employee_leave_balances_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_goals DROP CONSTRAINT IF EXISTS employee_goals_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_documents DROP CONSTRAINT IF EXISTS employee_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.company_announcements DROP CONSTRAINT IF EXISTS company_announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.candidates DROP CONSTRAINT IF EXISTS candidates_pkey;
ALTER TABLE IF EXISTS ONLY public.biometric_devices DROP CONSTRAINT IF EXISTS biometric_devices_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_regularizations DROP CONSTRAINT IF EXISTS attendance_regularizations_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.assets DROP CONSTRAINT IF EXISTS assets_pkey;
ALTER TABLE IF EXISTS ONLY public.asset_allocations DROP CONSTRAINT IF EXISTS asset_allocations_pkey;
ALTER TABLE IF EXISTS ONLY public.appraisal_cycles DROP CONSTRAINT IF EXISTS appraisal_cycles_pkey;
ALTER TABLE IF EXISTS ONLY public.announcement_acknowledgments DROP CONSTRAINT IF EXISTS announcement_acknowledgments_pkey;
ALTER TABLE IF EXISTS public.workflow_steps ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.workflow_instances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.workflow_definitions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.workflow_approvals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ticket_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tenant_subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tenant_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tax_declarations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.support_tickets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shifts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shift_swap_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.separation_clearances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roster_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.refresh_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.policy_acknowledgements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.performance_reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payroll_slips ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.office_locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.login_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leave_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leave_policies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_postings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_openings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interview_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interview_scorecards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.hr_policy_articles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.full_and_final_settlements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.flight_risk_evaluations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.expense_claims ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_separations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_leave_balances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_goals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.candidates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.biometric_devices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance_regularizations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.assets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.asset_allocations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appraisal_cycles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcement_acknowledgments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.workflow_steps_id_seq;
DROP TABLE IF EXISTS public.workflow_steps;
DROP SEQUENCE IF EXISTS public.workflow_instances_id_seq;
DROP TABLE IF EXISTS public.workflow_instances;
DROP SEQUENCE IF EXISTS public.workflow_definitions_id_seq;
DROP TABLE IF EXISTS public.workflow_definitions;
DROP SEQUENCE IF EXISTS public.workflow_approvals_id_seq;
DROP TABLE IF EXISTS public.workflow_approvals;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_roles;
DROP SEQUENCE IF EXISTS public.ticket_comments_id_seq;
DROP TABLE IF EXISTS public.ticket_comments;
DROP TABLE IF EXISTS public.tenants;
DROP SEQUENCE IF EXISTS public.tenant_subscriptions_id_seq;
DROP TABLE IF EXISTS public.tenant_subscriptions;
DROP SEQUENCE IF EXISTS public.tenant_settings_id_seq;
DROP TABLE IF EXISTS public.tenant_settings;
DROP SEQUENCE IF EXISTS public.tax_declarations_id_seq;
DROP TABLE IF EXISTS public.tax_declarations;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP SEQUENCE IF EXISTS public.support_tickets_id_seq;
DROP TABLE IF EXISTS public.support_tickets;
DROP SEQUENCE IF EXISTS public.shifts_id_seq;
DROP TABLE IF EXISTS public.shifts;
DROP SEQUENCE IF EXISTS public.shift_swap_requests_id_seq;
DROP TABLE IF EXISTS public.shift_swap_requests;
DROP SEQUENCE IF EXISTS public.separation_clearances_id_seq;
DROP TABLE IF EXISTS public.separation_clearances;
DROP SEQUENCE IF EXISTS public.roster_assignments_id_seq;
DROP TABLE IF EXISTS public.roster_assignments;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP SEQUENCE IF EXISTS public.refresh_tokens_id_seq;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP SEQUENCE IF EXISTS public.policy_acknowledgements_id_seq;
DROP TABLE IF EXISTS public.policy_acknowledgements;
DROP SEQUENCE IF EXISTS public.permissions_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.performance_reviews_id_seq;
DROP TABLE IF EXISTS public.performance_reviews;
DROP SEQUENCE IF EXISTS public.payroll_slips_id_seq;
DROP TABLE IF EXISTS public.payroll_slips;
DROP SEQUENCE IF EXISTS public.office_locations_id_seq;
DROP TABLE IF EXISTS public.office_locations;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.login_history_id_seq;
DROP TABLE IF EXISTS public.login_history;
DROP SEQUENCE IF EXISTS public.leave_requests_id_seq;
DROP TABLE IF EXISTS public.leave_requests;
DROP SEQUENCE IF EXISTS public.leave_policies_id_seq;
DROP TABLE IF EXISTS public.leave_policies;
DROP SEQUENCE IF EXISTS public.job_postings_id_seq;
DROP TABLE IF EXISTS public.job_postings;
DROP SEQUENCE IF EXISTS public.job_openings_id_seq;
DROP TABLE IF EXISTS public.job_openings;
DROP SEQUENCE IF EXISTS public.interview_sessions_id_seq;
DROP TABLE IF EXISTS public.interview_sessions;
DROP SEQUENCE IF EXISTS public.interview_scorecards_id_seq;
DROP TABLE IF EXISTS public.interview_scorecards;
DROP SEQUENCE IF EXISTS public.hr_policy_articles_id_seq;
DROP TABLE IF EXISTS public.hr_policy_articles;
DROP SEQUENCE IF EXISTS public.full_and_final_settlements_id_seq;
DROP TABLE IF EXISTS public.full_and_final_settlements;
DROP SEQUENCE IF EXISTS public.flight_risk_evaluations_id_seq;
DROP TABLE IF EXISTS public.flight_risk_evaluations;
DROP SEQUENCE IF EXISTS public.expense_claims_id_seq;
DROP TABLE IF EXISTS public.expense_claims;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.employee_separations_id_seq;
DROP TABLE IF EXISTS public.employee_separations;
DROP SEQUENCE IF EXISTS public.employee_requests_id_seq;
DROP TABLE IF EXISTS public.employee_requests;
DROP SEQUENCE IF EXISTS public.employee_leave_balances_id_seq;
DROP TABLE IF EXISTS public.employee_leave_balances;
DROP SEQUENCE IF EXISTS public.employee_goals_id_seq;
DROP TABLE IF EXISTS public.employee_goals;
DROP SEQUENCE IF EXISTS public.employee_documents_id_seq;
DROP TABLE IF EXISTS public.employee_documents;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.company_announcements_id_seq;
DROP TABLE IF EXISTS public.company_announcements;
DROP SEQUENCE IF EXISTS public.candidates_id_seq;
DROP TABLE IF EXISTS public.candidates;
DROP SEQUENCE IF EXISTS public.biometric_devices_id_seq;
DROP TABLE IF EXISTS public.biometric_devices;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.attendance_regularizations_id_seq;
DROP TABLE IF EXISTS public.attendance_regularizations;
DROP SEQUENCE IF EXISTS public.attendance_id_seq;
DROP TABLE IF EXISTS public.attendance;
DROP SEQUENCE IF EXISTS public.assets_id_seq;
DROP TABLE IF EXISTS public.assets;
DROP SEQUENCE IF EXISTS public.asset_allocations_id_seq;
DROP TABLE IF EXISTS public.asset_allocations;
DROP SEQUENCE IF EXISTS public.appraisal_cycles_id_seq;
DROP TABLE IF EXISTS public.appraisal_cycles;
DROP SEQUENCE IF EXISTS public.announcement_acknowledgments_id_seq;
DROP TABLE IF EXISTS public.announcement_acknowledgments;
DROP FUNCTION IF EXISTS public.dayofyear(d date);
--
-- Name: dayofyear(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.dayofyear(d date) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN EXTRACT(DOY FROM d)::integer;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcement_acknowledgments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement_acknowledgments (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    announcement_id bigint NOT NULL,
    user_id bigint NOT NULL,
    acknowledged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150)
);


--
-- Name: announcement_acknowledgments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcement_acknowledgments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcement_acknowledgments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcement_acknowledgments_id_seq OWNED BY public.announcement_acknowledgments.id;


--
-- Name: appraisal_cycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appraisal_cycles (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    year integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'GOAL_SETTING'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: appraisal_cycles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appraisal_cycles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appraisal_cycles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appraisal_cycles_id_seq OWNED BY public.appraisal_cycles.id;


--
-- Name: asset_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_allocations (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    asset_id bigint,
    employee_id bigint,
    allocated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    returned_at timestamp without time zone,
    allocation_status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150)
);


--
-- Name: asset_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_allocations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_allocations_id_seq OWNED BY public.asset_allocations.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    asset_tag character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    brand character varying(100),
    model character varying(100),
    serial_number character varying(100),
    purchase_date date,
    warranty_expiry date,
    cost numeric(12,2),
    condition_status character varying(50) DEFAULT 'GOOD'::character varying,
    status character varying(50) DEFAULT 'AVAILABLE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    check_in_time time(6) without time zone,
    check_out_time time(6) without time zone,
    date date NOT NULL,
    late_arrival_reason character varying(500),
    overtime_hours double precision,
    remarks character varying(500),
    status character varying(25) NOT NULL,
    working_hours double precision,
    employee_id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    check_in_latitude numeric(10,7),
    check_in_longitude numeric(10,7),
    check_out_latitude numeric(10,7),
    check_out_longitude numeric(10,7),
    geofence_status character varying(30) DEFAULT 'INSIDE_GEOFENCE'::character varying,
    ip_address character varying(50),
    office_location_id bigint,
    selfie_url character varying(500),
    regularization_status character varying(30) DEFAULT 'NONE'::character varying,
    punch_source character varying(50) DEFAULT 'WEB_MANUAL'::character varying,
    device_id character varying(100),
    break_minutes integer DEFAULT 0,
    is_on_break boolean DEFAULT false,
    last_break_start timestamp without time zone,
    work_mode character varying(30) DEFAULT 'OFFICE'::character varying,
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'HALF_DAY'::character varying, 'WORK_FROM_HOME'::character varying, 'ON_LEAVE'::character varying, 'HOLIDAY'::character varying, 'LATE_ARRIVAL'::character varying])::text[])))
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: attendance_regularizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_regularizations (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    attendance_id bigint,
    employee_id bigint NOT NULL,
    date date NOT NULL,
    requested_check_in time without time zone,
    requested_check_out time without time zone,
    reason character varying(500) NOT NULL,
    status character varying(25) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewer_id bigint,
    reviewer_comments character varying(500),
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: attendance_regularizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_regularizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_regularizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_regularizations_id_seq OWNED BY public.attendance_regularizations.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(100) NOT NULL,
    description character varying(500),
    entity_id bigint,
    entity_type character varying(50),
    ip_address character varying(50),
    module character varying(50),
    new_values json,
    old_values json,
    performed_at timestamp(6) without time zone NOT NULL,
    performed_by character varying(150),
    request_id character varying(100),
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: biometric_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biometric_devices (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    device_code character varying(50) NOT NULL,
    device_name character varying(100) NOT NULL,
    ip_address character varying(50),
    location character varying(100),
    is_active boolean DEFAULT true,
    last_sync_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: biometric_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.biometric_devices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: biometric_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.biometric_devices_id_seq OWNED BY public.biometric_devices.id;


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    current_ctc numeric(12,2),
    email character varying(150),
    expected_ctc numeric(12,2),
    experience_years integer,
    linkedin_url character varying(300),
    name character varying(150) NOT NULL,
    notes text,
    notice_period_days integer,
    phone character varying(20),
    rejection_reason character varying(500),
    resume_url character varying(500),
    source character varying(100),
    stage character varying(30),
    job_posting_id bigint NOT NULL,
    referred_by bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    CONSTRAINT candidates_stage_check CHECK (((stage)::text = ANY ((ARRAY['APPLIED'::character varying, 'SCREENING'::character varying, 'INTERVIEW_ROUND_1'::character varying, 'INTERVIEW_ROUND_2'::character varying, 'TECHNICAL'::character varying, 'HR_ROUND'::character varying, 'OFFER_PENDING'::character varying, 'OFFER_ACCEPTED'::character varying, 'OFFER_REJECTED'::character varying, 'HIRED'::character varying, 'DROPPED'::character varying])::text[])))
);


--
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.candidates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- Name: company_announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_announcements (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    category character varying(32) DEFAULT 'GENERAL'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'NORMAL'::character varying NOT NULL,
    target_audience character varying(32) DEFAULT 'ALL'::character varying NOT NULL,
    department_id bigint,
    pinned boolean DEFAULT false NOT NULL,
    author_id bigint NOT NULL,
    published_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone,
    acknowledgment_required boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: company_announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_announcements_id_seq OWNED BY public.company_announcements.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    budget double precision,
    code character varying(10),
    deleted boolean,
    description character varying(500),
    is_active boolean,
    location character varying(100),
    name character varying(100) NOT NULL,
    manager_id bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_documents (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    category character varying(50) NOT NULL,
    title character varying(150) NOT NULL,
    document_number character varying(100),
    file_path character varying(500) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100) NOT NULL,
    issue_date date,
    expiry_date date,
    status character varying(25) DEFAULT 'PENDING'::character varying NOT NULL,
    verified_by bigint,
    verified_at timestamp without time zone,
    verification_remarks character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: employee_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_documents_id_seq OWNED BY public.employee_documents.id;


--
-- Name: employee_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_goals (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    cycle_id bigint,
    employee_id bigint,
    title character varying(255) NOT NULL,
    description text,
    metric_target character varying(100),
    metric_current character varying(100),
    weightage integer DEFAULT 25,
    progress integer DEFAULT 0,
    status character varying(50) DEFAULT 'IN_PROGRESS'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: employee_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_goals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_goals_id_seq OWNED BY public.employee_goals.id;


--
-- Name: employee_leave_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_leave_balances (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    leave_type character varying(30) NOT NULL,
    allocated_days numeric(5,2) DEFAULT 0.0 NOT NULL,
    used_days numeric(5,2) DEFAULT 0.0 NOT NULL,
    pending_days numeric(5,2) DEFAULT 0.0 NOT NULL,
    balance_days numeric(5,2) DEFAULT 0.0 NOT NULL,
    year integer DEFAULT 2026 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: employee_leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_leave_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_leave_balances_id_seq OWNED BY public.employee_leave_balances.id;


--
-- Name: employee_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_requests (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    request_type character varying(30) NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    start_date date,
    end_date date,
    amount numeric(10,2),
    attachment_url character varying(500),
    status character varying(25) DEFAULT 'PENDING'::character varying NOT NULL,
    current_step integer DEFAULT 1 NOT NULL,
    approver_comments character varying(500),
    reviewed_by bigint,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: employee_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_requests_id_seq OWNED BY public.employee_requests.id;


--
-- Name: employee_separations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_separations (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    resignation_date date NOT NULL,
    requested_last_working_day date,
    approved_last_working_day date,
    reason text,
    separation_type character varying(32) DEFAULT 'RESIGNATION'::character varying NOT NULL,
    status character varying(32) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    reviewer_id bigint,
    reviewer_comments text,
    exit_interview_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: employee_separations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_separations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_separations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_separations_id_seq OWNED BY public.employee_separations.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    address character varying(255),
    alternate_phone character varying(15),
    bank_account_number character varying(30),
    bank_name character varying(100),
    casual_leave_balance integer,
    city character varying(100),
    country character varying(100),
    date_of_birth date,
    date_of_confirmation date,
    date_of_joining date NOT NULL,
    date_of_leaving date,
    deleted boolean NOT NULL,
    designation character varying(100),
    email character varying(150) NOT NULL,
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(15),
    emergency_contact_relation character varying(50),
    employee_number character varying(20) NOT NULL,
    employment_status character varying(25),
    esi_number character varying(30),
    first_name character varying(50) NOT NULL,
    gender character varying(20),
    ifsc_code character varying(15),
    job_title character varying(100),
    last_name character varying(50) NOT NULL,
    last_working_date date,
    leave_balance integer,
    pan_number character varying(20),
    pf_number character varying(30),
    phone_number character varying(15),
    pincode character varying(10),
    profile_picture_url character varying(500),
    resume_url character varying(500),
    salary numeric(12,2),
    shift_type character varying(20),
    sick_leave_balance integer,
    state character varying(100),
    department_id bigint,
    manager_id bigint,
    user_id bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    CONSTRAINT employees_employment_status_check CHECK (((employment_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'ON_LEAVE'::character varying, 'TERMINATED'::character varying, 'RESIGNED'::character varying, 'PROBATION'::character varying, 'NOTICE_PERIOD'::character varying])::text[]))),
    CONSTRAINT employees_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying, 'PREFER_NOT_TO_SAY'::character varying])::text[]))),
    CONSTRAINT employees_shift_type_check CHECK (((shift_type)::text = ANY ((ARRAY['MORNING'::character varying, 'AFTERNOON'::character varying, 'NIGHT'::character varying, 'FLEXIBLE'::character varying, 'ROTATIONAL'::character varying])::text[])))
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: expense_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_claims (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    claim_number character varying(32) NOT NULL,
    category character varying(32) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    amount numeric(12,2) NOT NULL,
    expense_date date NOT NULL,
    status character varying(32) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    receipt_url character varying(512),
    receipt_filename character varying(255),
    manager_id bigint,
    manager_remarks text,
    manager_reviewed_at timestamp without time zone,
    finance_reviewer_id bigint,
    finance_remarks text,
    finance_reviewed_at timestamp without time zone,
    payroll_slip_id bigint,
    disbursed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150),
    CONSTRAINT chk_exp_category CHECK (((category)::text = ANY ((ARRAY['TRAVEL'::character varying, 'MEALS'::character varying, 'INTERNET_WFH'::character varying, 'OFFICE_SUPPLIES'::character varying, 'FUEL'::character varying, 'CERTIFICATION'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT chk_exp_status CHECK (((status)::text = ANY ((ARRAY['SUBMITTED'::character varying, 'MANAGER_APPROVED'::character varying, 'FINANCE_APPROVED'::character varying, 'DISBURSED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: expense_claims_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_claims_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_claims_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_claims_id_seq OWNED BY public.expense_claims.id;


--
-- Name: flight_risk_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flight_risk_evaluations (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    risk_score integer NOT NULL,
    risk_level character varying(20) NOT NULL,
    primary_driver character varying(100) NOT NULL,
    driver_breakdown text,
    retention_recommendation text NOT NULL,
    evaluated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_at timestamp without time zone,
    updated_by character varying(150)
);


--
-- Name: flight_risk_evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flight_risk_evaluations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flight_risk_evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flight_risk_evaluations_id_seq OWNED BY public.flight_risk_evaluations.id;


--
-- Name: full_and_final_settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.full_and_final_settlements (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    separation_id bigint NOT NULL,
    employee_id bigint NOT NULL,
    settlement_date date NOT NULL,
    last_drawn_basic numeric(12,2) DEFAULT 0.00 NOT NULL,
    tenure_years numeric(4,2) DEFAULT 0.00 NOT NULL,
    earned_leave_balance integer DEFAULT 0,
    leave_encashment_amount numeric(12,2) DEFAULT 0.00,
    gratuity_amount numeric(12,2) DEFAULT 0.00,
    bonus_amount numeric(12,2) DEFAULT 0.00,
    prorated_salary_amount numeric(12,2) DEFAULT 0.00,
    notice_pay_recovery numeric(12,2) DEFAULT 0.00,
    asset_recovery_deduction numeric(12,2) DEFAULT 0.00,
    statutory_deductions numeric(12,2) DEFAULT 0.00,
    net_payable_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    remarks text,
    disbursed_at timestamp without time zone,
    transaction_reference character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: full_and_final_settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.full_and_final_settlements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: full_and_final_settlements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.full_and_final_settlements_id_seq OWNED BY public.full_and_final_settlements.id;


--
-- Name: hr_policy_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hr_policy_articles (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    category character varying(60) NOT NULL,
    title character varying(255) NOT NULL,
    summary text NOT NULL,
    content text NOT NULL,
    keywords character varying(500),
    action_label character varying(100),
    action_route character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_at timestamp without time zone,
    updated_by character varying(150)
);


--
-- Name: hr_policy_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hr_policy_articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hr_policy_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hr_policy_articles_id_seq OWNED BY public.hr_policy_articles.id;


--
-- Name: interview_scorecards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_scorecards (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    candidate_id bigint,
    interviewer_id bigint,
    round_name character varying(100) NOT NULL,
    technical_rating integer DEFAULT 3,
    communication_rating integer DEFAULT 3,
    culture_fit_rating integer DEFAULT 3,
    recommendation character varying(50) DEFAULT 'HIRE'::character varying NOT NULL,
    feedback text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    interview_session_id bigint,
    integrity_score integer DEFAULT 100,
    integrity_summary text
);


--
-- Name: interview_scorecards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interview_scorecards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interview_scorecards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interview_scorecards_id_seq OWNED BY public.interview_scorecards.id;


--
-- Name: interview_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_sessions (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    candidate_id bigint NOT NULL,
    job_posting_id bigint,
    interviewer_id bigint NOT NULL,
    round_name character varying(100) NOT NULL,
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone NOT NULL,
    status character varying(30) DEFAULT 'SCHEDULED'::character varying NOT NULL,
    room_name character varying(150) NOT NULL,
    guest_access_token character varying(128) NOT NULL,
    guest_token_expiry timestamp without time zone NOT NULL,
    meeting_link character varying(255),
    interviewer_joined_at timestamp without time zone,
    candidate_joined_at timestamp without time zone,
    completed_at timestamp without time zone,
    interview_notes text,
    integrity_status character varying(50) DEFAULT 'CLEAN'::character varying,
    integrity_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: interview_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interview_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interview_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interview_sessions_id_seq OWNED BY public.interview_sessions.id;


--
-- Name: job_openings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_openings (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    department_id bigint,
    title character varying(255) NOT NULL,
    description text,
    openings_count integer DEFAULT 1,
    min_experience integer DEFAULT 0,
    max_experience integer DEFAULT 5,
    budget_min numeric(12,2),
    budget_max numeric(12,2),
    job_type character varying(50) DEFAULT 'FULL_TIME'::character varying,
    status character varying(50) DEFAULT 'OPEN'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: job_openings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_openings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_openings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_openings_id_seq OWNED BY public.job_openings.id;


--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_postings (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    closes_at date,
    description text,
    experience_max integer,
    experience_min integer,
    location character varying(100),
    openings integer,
    requirements text,
    salary_max numeric(12,2),
    salary_min numeric(12,2),
    status character varying(20),
    title character varying(200) NOT NULL,
    department_id bigint,
    hiring_manager_id bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: job_postings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_postings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_postings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_postings_id_seq OWNED BY public.job_postings.id;


--
-- Name: leave_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_policies (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    leave_type character varying(30) NOT NULL,
    annual_allowance numeric(5,2) DEFAULT 12.0 NOT NULL,
    monthly_accrual_rate numeric(5,2) DEFAULT 1.0 NOT NULL,
    max_carry_over numeric(5,2) DEFAULT 5.0 NOT NULL,
    allows_half_day boolean DEFAULT true NOT NULL,
    requires_attachment boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: leave_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_policies_id_seq OWNED BY public.leave_policies.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_requests (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    approver_comments character varying(500),
    attachment_url character varying(500),
    end_date date NOT NULL,
    leave_type character varying(20) NOT NULL,
    number_of_days integer NOT NULL,
    reason character varying(1000) NOT NULL,
    reviewed_at timestamp(6) without time zone,
    start_date date NOT NULL,
    status character varying(20) NOT NULL,
    employee_id bigint NOT NULL,
    reviewed_by bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    CONSTRAINT leave_requests_leave_type_check CHECK (((leave_type)::text = ANY ((ARRAY['ANNUAL'::character varying, 'SICK'::character varying, 'CASUAL'::character varying, 'MATERNITY'::character varying, 'PATERNITY'::character varying, 'UNPAID'::character varying, 'COMPENSATORY'::character varying, 'EMERGENCY'::character varying, 'BEREAVEMENT'::character varying])::text[]))),
    CONSTRAINT leave_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying, 'RECALLED'::character varying])::text[])))
);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: login_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_history (
    id bigint NOT NULL,
    browser character varying(100),
    device_type character varying(30),
    ip_address character varying(50),
    location character varying(200),
    login_at timestamp(6) without time zone NOT NULL,
    logout_at timestamp(6) without time zone,
    os_name character varying(100),
    session_id character varying(255),
    status character varying(20),
    user_agent character varying(500),
    user_id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: login_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.login_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: login_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.login_history_id_seq OWNED BY public.login_history.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    action_url character varying(500),
    entity_id bigint,
    entity_type character varying(50),
    is_read boolean,
    message character varying(1000) NOT NULL,
    read_at timestamp(6) without time zone,
    title character varying(200) NOT NULL,
    type character varying(30) NOT NULL,
    user_id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['LEAVE_APPLIED'::character varying, 'LEAVE_APPROVED'::character varying, 'LEAVE_REJECTED'::character varying, 'PAYROLL_PROCESSED'::character varying, 'INTERVIEW_SCHEDULED'::character varying, 'OFFER_ISSUED'::character varying, 'TASK_ASSIGNED'::character varying, 'REVIEW_DUE'::character varying, 'ACCOUNT_LOCKED'::character varying, 'BIRTHDAY'::character varying, 'WORK_ANNIVERSARY'::character varying, 'ANNOUNCEMENT'::character varying, 'SYSTEM'::character varying])::text[])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: office_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.office_locations (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(255),
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    radius_meters integer DEFAULT 200 NOT NULL,
    ip_whitelist character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: office_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.office_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: office_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.office_locations_id_seq OWNED BY public.office_locations.id;


--
-- Name: payroll_slips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_slips (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    basic_salary numeric(12,2),
    gross_salary numeric(12,2),
    hra numeric(12,2),
    income_tax numeric(12,2),
    leave_days integer,
    payroll_month integer NOT NULL,
    net_salary numeric(12,2),
    other_allowances numeric(12,2),
    other_deductions numeric(12,2),
    paid_at timestamp(6) without time zone,
    payment_reference character varying(100),
    pf_deduction numeric(12,2),
    present_days integer,
    processed_at timestamp(6) without time zone,
    professional_tax numeric(12,2),
    slip_url character varying(500),
    special_allowance numeric(12,2),
    status character varying(20),
    total_deductions numeric(12,2),
    working_days integer,
    payroll_year integer NOT NULL,
    employee_id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    reimbursements numeric(12,2) DEFAULT 0.00,
    adjusted_at timestamp(6) without time zone,
    adjusted_by character varying(100),
    bonus numeric(12,2),
    deductions_adjustment numeric(12,2),
    hr_remarks character varying(500),
    overtime_amount numeric(12,2),
    CONSTRAINT payroll_slips_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PROCESSING'::character varying, 'PROCESSED'::character varying, 'APPROVED'::character varying, 'PAID'::character varying, 'FAILED'::character varying])::text[])))
);


--
-- Name: payroll_slips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payroll_slips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payroll_slips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payroll_slips_id_seq OWNED BY public.payroll_slips.id;


--
-- Name: performance_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.performance_reviews (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    areas_of_improvement text,
    final_rating double precision,
    goals_next_cycle text,
    manager_comments text,
    manager_rating integer,
    review_cycle character varying(50) NOT NULL,
    review_period_end date,
    review_period_start date,
    self_comments text,
    self_rating integer,
    status character varying(20),
    strengths text,
    employee_id bigint NOT NULL,
    reviewer_id bigint,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: performance_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.performance_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: performance_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.performance_reviews_id_seq OWNED BY public.performance_reviews.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: policy_acknowledgements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.policy_acknowledgements (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    document_id bigint NOT NULL,
    employee_id bigint NOT NULL,
    acknowledged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address character varying(50),
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150)
);


--
-- Name: policy_acknowledgements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.policy_acknowledgements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: policy_acknowledgements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.policy_acknowledgements_id_seq OWNED BY public.policy_acknowledgements.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    device_info character varying(300),
    expiry_date timestamp(6) with time zone NOT NULL,
    ip_address character varying(50),
    is_revoked boolean,
    revoked_at timestamp(6) with time zone,
    token character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    is_system_role boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: roster_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roster_assignments (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    employee_id bigint NOT NULL,
    shift_id bigint NOT NULL,
    effective_date date NOT NULL,
    rotation_pattern character varying(50) DEFAULT 'STANDARD'::character varying NOT NULL,
    assigned_by_user_id bigint,
    notes text,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: roster_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roster_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roster_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roster_assignments_id_seq OWNED BY public.roster_assignments.id;


--
-- Name: separation_clearances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.separation_clearances (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    separation_id bigint NOT NULL,
    department_type character varying(32) NOT NULL,
    status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    cleared_by character varying(120),
    cleared_at timestamp without time zone,
    pending_dues numeric(12,2) DEFAULT 0.00,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: separation_clearances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.separation_clearances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: separation_clearances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.separation_clearances_id_seq OWNED BY public.separation_clearances.id;


--
-- Name: shift_swap_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_swap_requests (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    requester_employee_id bigint NOT NULL,
    target_employee_id bigint NOT NULL,
    requester_roster_id bigint NOT NULL,
    target_roster_id bigint NOT NULL,
    swap_date date NOT NULL,
    reason text NOT NULL,
    peer_status character varying(50) DEFAULT 'PENDING_PEER'::character varying NOT NULL,
    manager_status character varying(50) DEFAULT 'PENDING_MANAGER'::character varying NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by_user_id bigint,
    manager_remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: shift_swap_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shift_swap_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shift_swap_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shift_swap_requests_id_seq OWNED BY public.shift_swap_requests.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    name character varying(100) NOT NULL,
    shift_code character varying(50) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    grace_period_mins integer DEFAULT 15 NOT NULL,
    break_duration_mins integer DEFAULT 60 NOT NULL,
    is_night_shift boolean DEFAULT false NOT NULL,
    night_allowance_rate numeric(10,2) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    ticket_number character varying(32) NOT NULL,
    employee_id bigint NOT NULL,
    category character varying(32) NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    status character varying(32) DEFAULT 'OPEN'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    asset_id bigint,
    assigned_to bigint,
    sla_deadline timestamp without time zone,
    resolution_notes text,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id bigint NOT NULL,
    description character varying(255),
    setting_key character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    setting_value text NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: tax_declarations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_declarations (
    id bigint NOT NULL,
    tenant_id character varying(50) NOT NULL,
    employee_id bigint,
    financial_year character varying(20) NOT NULL,
    regime character varying(20) DEFAULT 'NEW'::character varying NOT NULL,
    declared_80c numeric(12,2) DEFAULT 0.00,
    declared_80d numeric(12,2) DEFAULT 0.00,
    declared_hra numeric(12,2) DEFAULT 0.00,
    status character varying(50) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: tax_declarations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tax_declarations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tax_declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tax_declarations_id_seq OWNED BY public.tax_declarations.id;


--
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_settings (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text NOT NULL,
    description character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: tenant_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenant_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenant_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenant_settings_id_seq OWNED BY public.tenant_settings.id;


--
-- Name: tenant_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_subscriptions (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    plan_name character varying(50) DEFAULT 'ENTERPRISE'::character varying NOT NULL,
    max_employees integer DEFAULT 1000 NOT NULL,
    features jsonb,
    starts_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tenant_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tenant_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tenant_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tenant_subscriptions_id_seq OWNED BY public.tenant_subscriptions.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id character varying(64) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    domain character varying(255),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    subscription_tier character varying(50) DEFAULT 'ENTERPRISE'::character varying NOT NULL,
    logo_url character varying(500),
    primary_color character varying(20) DEFAULT '#2563eb'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: ticket_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_comments (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    ticket_id bigint NOT NULL,
    author_id bigint NOT NULL,
    comment_text text NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150)
);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_comments_id_seq OWNED BY public.ticket_comments.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150),
    account_locked_until timestamp(6) without time zone,
    deleted boolean NOT NULL,
    email character varying(150) NOT NULL,
    email_verified boolean,
    email_verify_expiry timestamp(6) without time zone,
    email_verify_token character varying(255),
    failed_login_attempts integer,
    first_name character varying(50) NOT NULL,
    is_active boolean,
    last_login_at timestamp(6) without time zone,
    last_login_ip character varying(50),
    last_name character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    password_changed_at timestamp(6) without time zone,
    password_reset_expiry timestamp(6) without time zone,
    password_reset_token_hash character varying(255),
    profile_picture character varying(500),
    role character varying(25) NOT NULL,
    totp_backup_codes character varying(1000),
    totp_enabled boolean,
    totp_secret character varying(255),
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    must_change_password boolean DEFAULT false,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ROLE_SUPER_ADMIN'::character varying, 'ROLE_ADMIN'::character varying, 'ROLE_HR'::character varying, 'ROLE_MANAGER'::character varying, 'ROLE_EMPLOYEE'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workflow_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_approvals (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    workflow_instance_id bigint NOT NULL,
    step_order integer NOT NULL,
    approver_id bigint NOT NULL,
    decision character varying(25) NOT NULL,
    comments character varying(500),
    ip_address character varying(50),
    decided_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(150),
    updated_at timestamp(6) without time zone,
    updated_by character varying(150)
);


--
-- Name: workflow_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_approvals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_approvals_id_seq OWNED BY public.workflow_approvals.id;


--
-- Name: workflow_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_definitions (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    module_type character varying(30) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: workflow_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_definitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_definitions_id_seq OWNED BY public.workflow_definitions.id;


--
-- Name: workflow_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_instances (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    workflow_definition_id bigint NOT NULL,
    entity_type character varying(30) NOT NULL,
    entity_id bigint NOT NULL,
    current_step_order integer DEFAULT 1 NOT NULL,
    total_steps integer DEFAULT 1 NOT NULL,
    status character varying(25) DEFAULT 'PENDING'::character varying NOT NULL,
    initiated_by bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: workflow_instances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_instances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_instances_id_seq OWNED BY public.workflow_instances.id;


--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_steps (
    id bigint NOT NULL,
    tenant_id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    workflow_definition_id bigint NOT NULL,
    step_order integer NOT NULL,
    step_name character varying(100) NOT NULL,
    approver_type character varying(30) NOT NULL,
    approver_role character varying(50),
    sla_hours integer DEFAULT 48,
    is_auto_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(150),
    updated_by character varying(150)
);


--
-- Name: workflow_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_steps_id_seq OWNED BY public.workflow_steps.id;


--
-- Name: announcement_acknowledgments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_acknowledgments ALTER COLUMN id SET DEFAULT nextval('public.announcement_acknowledgments_id_seq'::regclass);


--
-- Name: appraisal_cycles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appraisal_cycles ALTER COLUMN id SET DEFAULT nextval('public.appraisal_cycles_id_seq'::regclass);


--
-- Name: asset_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_allocations ALTER COLUMN id SET DEFAULT nextval('public.asset_allocations_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: attendance_regularizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations ALTER COLUMN id SET DEFAULT nextval('public.attendance_regularizations_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: biometric_devices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_devices ALTER COLUMN id SET DEFAULT nextval('public.biometric_devices_id_seq'::regclass);


--
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- Name: company_announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_announcements ALTER COLUMN id SET DEFAULT nextval('public.company_announcements_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: employee_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents ALTER COLUMN id SET DEFAULT nextval('public.employee_documents_id_seq'::regclass);


--
-- Name: employee_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_goals ALTER COLUMN id SET DEFAULT nextval('public.employee_goals_id_seq'::regclass);


--
-- Name: employee_leave_balances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_balances ALTER COLUMN id SET DEFAULT nextval('public.employee_leave_balances_id_seq'::regclass);


--
-- Name: employee_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_requests ALTER COLUMN id SET DEFAULT nextval('public.employee_requests_id_seq'::regclass);


--
-- Name: employee_separations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_separations ALTER COLUMN id SET DEFAULT nextval('public.employee_separations_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: expense_claims id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims ALTER COLUMN id SET DEFAULT nextval('public.expense_claims_id_seq'::regclass);


--
-- Name: flight_risk_evaluations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight_risk_evaluations ALTER COLUMN id SET DEFAULT nextval('public.flight_risk_evaluations_id_seq'::regclass);


--
-- Name: full_and_final_settlements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.full_and_final_settlements ALTER COLUMN id SET DEFAULT nextval('public.full_and_final_settlements_id_seq'::regclass);


--
-- Name: hr_policy_articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_policy_articles ALTER COLUMN id SET DEFAULT nextval('public.hr_policy_articles_id_seq'::regclass);


--
-- Name: interview_scorecards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards ALTER COLUMN id SET DEFAULT nextval('public.interview_scorecards_id_seq'::regclass);


--
-- Name: interview_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions ALTER COLUMN id SET DEFAULT nextval('public.interview_sessions_id_seq'::regclass);


--
-- Name: job_openings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings ALTER COLUMN id SET DEFAULT nextval('public.job_openings_id_seq'::regclass);


--
-- Name: job_postings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings ALTER COLUMN id SET DEFAULT nextval('public.job_postings_id_seq'::regclass);


--
-- Name: leave_policies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_policies ALTER COLUMN id SET DEFAULT nextval('public.leave_policies_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_history_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: office_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.office_locations ALTER COLUMN id SET DEFAULT nextval('public.office_locations_id_seq'::regclass);


--
-- Name: payroll_slips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_slips ALTER COLUMN id SET DEFAULT nextval('public.payroll_slips_id_seq'::regclass);


--
-- Name: performance_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews ALTER COLUMN id SET DEFAULT nextval('public.performance_reviews_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: policy_acknowledgements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements ALTER COLUMN id SET DEFAULT nextval('public.policy_acknowledgements_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: roster_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments ALTER COLUMN id SET DEFAULT nextval('public.roster_assignments_id_seq'::regclass);


--
-- Name: separation_clearances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.separation_clearances ALTER COLUMN id SET DEFAULT nextval('public.separation_clearances_id_seq'::regclass);


--
-- Name: shift_swap_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests ALTER COLUMN id SET DEFAULT nextval('public.shift_swap_requests_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: tax_declarations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_declarations ALTER COLUMN id SET DEFAULT nextval('public.tax_declarations_id_seq'::regclass);


--
-- Name: tenant_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings ALTER COLUMN id SET DEFAULT nextval('public.tenant_settings_id_seq'::regclass);


--
-- Name: tenant_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.tenant_subscriptions_id_seq'::regclass);


--
-- Name: ticket_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments ALTER COLUMN id SET DEFAULT nextval('public.ticket_comments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workflow_approvals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals ALTER COLUMN id SET DEFAULT nextval('public.workflow_approvals_id_seq'::regclass);


--
-- Name: workflow_definitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions ALTER COLUMN id SET DEFAULT nextval('public.workflow_definitions_id_seq'::regclass);


--
-- Name: workflow_instances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances ALTER COLUMN id SET DEFAULT nextval('public.workflow_instances_id_seq'::regclass);


--
-- Name: workflow_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps ALTER COLUMN id SET DEFAULT nextval('public.workflow_steps_id_seq'::regclass);


--
-- Data for Name: announcement_acknowledgments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcement_acknowledgments (id, tenant_id, announcement_id, user_id, acknowledged_at, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	1	1	2026-10-30 16:54:19.330366	2026-10-30 16:54:19.332469	admin@hrms.com	2026-10-30 16:54:19.332469	admin@hrms.com
2	default	2	1	2026-10-30 16:58:22.781821	2026-10-30 16:58:22.78282	admin@hrms.com	2026-10-30 16:58:22.78282	admin@hrms.com
3	default	3	1	2026-10-30 17:37:03.195126	2026-10-30 17:37:03.198168	admin@hrms.com	2026-10-30 17:37:03.198168	admin@hrms.com
4	default	4	1	2026-10-30 18:46:34.267423	2026-10-30 18:46:34.269419	admin@hrms.com	2026-10-30 18:46:34.269419	admin@hrms.com
5	default	5	1	2026-11-02 12:10:34.987107	2026-11-02 12:10:34.990105	admin@hrms.com	2026-11-02 12:10:34.990105	admin@hrms.com
\.


--
-- Data for Name: appraisal_cycles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appraisal_cycles (id, tenant_id, name, year, start_date, end_date, status, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	FY 2026-2027 Annual Performance Appraisal	2026	2026-04-01	2027-03-31	GOAL_SETTING	2026-10-29 11:52:30.013925	\N	\N	\N
2	default	FY 2026-2027 Annual Performance Appraisal	2026	2026-04-01	2027-03-31	GOAL_SETTING	2026-10-29 11:54:07.996903	\N	\N	\N
\.


--
-- Data for Name: asset_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_allocations (id, tenant_id, asset_id, employee_id, allocated_at, returned_at, allocation_status, notes, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	1	1	2026-10-29 11:52:30.0234	\N	ACTIVE	Primary engineering development workstation issued on joining.	2026-10-29 11:52:30.0234	\N	\N	\N
2	default	3	1	2026-10-29 11:52:30.0234	\N	ACTIVE	Secondary high-resolution 4K monitor issued for office desk.	2026-10-29 11:52:30.0234	\N	\N	\N
3	default	2	3	2026-10-29 13:08:43.637215	\N	ACTIVE		2026-10-29 13:08:43.639682	hr@hrms.com	2026-10-29 13:08:43.639682	hr@hrms.com
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, tenant_id, asset_tag, category, brand, model, serial_number, purchase_date, warranty_expiry, cost, condition_status, status, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	AST-LAP-001	LAPTOP	Apple	MacBook Pro 16" M3 Pro 36GB	C02G8792MD6R	2025-06-15	2028-06-15	249900.00	GOOD	ALLOCATED	2026-10-29 11:52:30.02109	\N	\N	\N
3	default	AST-MON-001	MONITOR	Dell	UltraSharp 27" 4K USB-C Hub	DL-MON-4412	2025-07-01	2028-07-01	48000.00	GOOD	ALLOCATED	2026-10-29 11:52:30.02109	\N	\N	\N
4	default	AST-CRD-001	ACCESS_CARD	HID	Corporate Smart RFID Access Key	RFID-990182	2026-01-01	2030-01-01	1500.00	GOOD	ALLOCATED	2026-10-29 11:52:30.02109	\N	\N	\N
2	default	AST-LAP-002	LAPTOP	Dell	XPS 15 9530 Core i9 32GB	DL-883921-X	2025-08-10	2028-08-10	195000.00	GOOD	ALLOCATED	2026-10-29 11:52:30.02109	2026-10-29 13:08:43.645225	\N	hr@hrms.com
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, created_at, created_by, updated_at, updated_by, check_in_time, check_out_time, date, late_arrival_reason, overtime_hours, remarks, status, working_hours, employee_id, tenant_id, check_in_latitude, check_in_longitude, check_out_latitude, check_out_longitude, geofence_status, ip_address, office_location_id, selfie_url, regularization_status, punch_source, device_id, break_minutes, is_on_break, last_break_start, work_mode) FROM stdin;
1	2026-10-28 17:49:25.755105	emp@hrms.com	2026-10-28 17:49:25.755105	emp@hrms.com	17:49:25	\N	2026-10-28	Late arrival after 09:30 AM	\N	Morning punch at HQ gate	LATE_ARRIVAL	\N	2	default	12.9716500	77.5946200	\N	\N	INSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
2	2026-10-28 18:17:12.948674	hr@hrms.com	2026-10-28 18:17:12.948674	hr@hrms.com	18:17:12	\N	2026-10-28	Late arrival after 09:30 AM	\N	Web punch (4538m accuracy)	LATE_ARRIVAL	\N	3	default	13.0272000	77.6063000	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
3	2026-10-29 11:27:36.784757	emp@hrms.com	2026-10-29 11:27:36.784757	emp@hrms.com	11:27:36	\N	2026-10-29	Late arrival after 09:30 AM	\N	Web punch (4538m accuracy)	LATE_ARRIVAL	\N	2	default	13.0272000	77.6063000	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
5	2026-10-29 13:50:46.419443	testqa_updated_9453@hrms.com	2026-10-29 13:50:46.419443	testqa_updated_9453@hrms.com	13:50:46	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	7	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
6	2026-10-29 13:56:23.34205	testqa_updated_7467@hrms.com	2026-10-29 13:56:23.34205	testqa_updated_7467@hrms.com	13:56:23	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	8	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
7	2026-10-29 14:00:24.691706	testqa_updated_1062@hrms.com	2026-10-29 14:00:24.691706	testqa_updated_1062@hrms.com	14:00:24	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	9	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
8	2026-10-29 14:02:02.724653	testqa_updated_2786@hrms.com	2026-10-29 14:02:02.724653	testqa_updated_2786@hrms.com	14:02:02	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	11	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
9	2026-10-29 14:04:50.860216	testqa_updated_6626@hrms.com	2026-10-29 14:04:50.860216	testqa_updated_6626@hrms.com	14:04:50	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	13	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
10	2026-10-29 14:06:31.420105	testqa_updated_2610@hrms.com	2026-10-29 14:06:31.420105	testqa_updated_2610@hrms.com	14:06:31	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	15	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
11	2026-10-29 18:22:23.085521	testqa_updated_4795@hrms.com	2026-10-29 18:22:23.085521	testqa_updated_4795@hrms.com	18:22:23	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	21	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
12	2026-10-29 18:24:35.881868	testqa_updated_9574@hrms.com	2026-10-29 18:24:35.881868	testqa_updated_9574@hrms.com	18:24:35	\N	2026-10-29	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	25	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
4	2026-10-29 13:20:42.92358	charankumar@gmail.com	2026-10-29 18:28:36.379908	chelikamcharankumar@gmail.com	13:20:42	18:28:36	2026-10-29	Late arrival after 09:30 AM	0	Web punch (4538m accuracy)	HALF_DAY	5.12	5	default	13.0272000	77.6063000	13.0272000	77.6063000	INSIDE_GEOFENCE	\N	2	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
13	2026-10-29 18:35:18.553231	hr@hrms.com	2026-10-29 18:35:22.628085	hr@hrms.com	18:35:18	18:35:22	2026-10-29	Late arrival after 09:30 AM	0	Web punch (4538m accuracy)	HALF_DAY	0	3	default	13.0272000	77.6063000	13.0272000	77.6063000	INSIDE_GEOFENCE	\N	2	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
14	2026-10-30 10:52:13.573826	chelikamcharankumar@gmail.com	2026-10-30 10:52:13.573826	chelikamcharankumar@gmail.com	10:52:13	\N	2026-10-30	Late arrival after 09:30 AM	\N	Web punch (4538m accuracy)	LATE_ARRIVAL	\N	5	default	13.0272000	77.6063000	\N	\N	INSIDE_GEOFENCE	\N	2	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
15	2026-10-30 12:20:39.507043	admin@hrms.com	2026-10-30 12:22:19.122017	admin@hrms.com	12:20:39.502	12:22:19	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0.02	26	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
16	2026-10-30 12:23:15.112194	testqa_updated_6871@hrms.com	2026-10-30 12:23:15.112194	testqa_updated_6871@hrms.com	12:23:15	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	29	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
20	2026-10-30 16:15:36.400207	admin@hrms.com	2026-10-30 16:15:38.429662	admin@hrms.com	16:15:36.395	16:15:38	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	33	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
18	2026-10-30 13:24:32.475293	admin@hrms.com	2026-10-30 13:24:34.439749	admin@hrms.com	13:24:32.47	13:24:34	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	31	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
19	2026-10-30 13:24:44.820176	testqa_updated_5379@hrms.com	2026-10-30 13:24:44.820176	testqa_updated_5379@hrms.com	13:24:44	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	32	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
17	2026-10-30 12:35:20.829605	admin@hrms.com	2026-10-30 12:35:22.672044	admin@hrms.com	12:35:20.83	12:35:22	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	30	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
21	2026-10-30 16:15:56.417713	testqa_updated_7964@hrms.com	2026-10-30 16:15:56.417713	testqa_updated_7964@hrms.com	16:15:56	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	34	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
22	2026-10-30 16:29:37.939708	admin@hrms.com	2026-10-30 16:29:39.857618	admin@hrms.com	16:29:37.939	16:29:39	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	35	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
25	2026-10-30 17:31:14.796646	hr@hrms.com	2026-10-30 17:31:14.796646	hr@hrms.com	17:31:14.797	\N	2026-10-30	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	3	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
23	2026-10-30 16:58:39.610451	admin@hrms.com	2026-10-30 16:58:41.617228	admin@hrms.com	16:58:39.606	16:58:41	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	36	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
24	2026-10-30 16:58:56.571315	testqa_updated_3569@hrms.com	2026-10-30 16:58:56.571315	testqa_updated_3569@hrms.com	16:58:56	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	37	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
27	2026-10-30 17:37:13.458394	testqa_updated_4278@hrms.com	2026-10-30 17:37:13.458394	testqa_updated_4278@hrms.com	17:37:13	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	40	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
26	2026-10-30 17:36:55.718793	admin@hrms.com	2026-10-30 17:36:57.680701	admin@hrms.com	17:36:55.714	17:36:57	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	39	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
28	2026-10-30 18:46:41.698571	admin@hrms.com	2026-10-30 18:46:43.675049	admin@hrms.com	18:46:41.695	18:46:43	2026-10-30	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	41	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
29	2026-10-30 18:47:03.661715	testqa_updated_6162@hrms.com	2026-10-30 18:47:03.661715	testqa_updated_6162@hrms.com	18:47:03	\N	2026-10-30	Late arrival after 09:30 AM	\N	QA Automated Check-In	LATE_ARRIVAL	\N	42	default	17.3850440	78.4866710	\N	\N	OUTSIDE_GEOFENCE	\N	1	\N	NONE	WEB_MANUAL	\N	0	f	\N	OFFICE
30	2026-11-02 12:10:41.736555	admin@hrms.com	2026-11-02 12:10:43.650975	admin@hrms.com	12:10:41.732	12:10:43	2026-11-02	Auto login after 09:30 AM	0	End of automated shift test	HALF_DAY	0	43	default	\N	\N	0.0000000	0.0000000	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	GATE-02	0	f	\N	OFFICE
31	2026-11-02 16:47:39.304656	hr@hrms.com	2026-11-02 16:47:39.304656	hr@hrms.com	16:47:39.3	\N	2026-11-02	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	3	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
32	2026-11-02 17:22:44.154617	admin@hrms.com	2026-11-02 17:22:44.154617	admin@hrms.com	17:22:44.146	\N	2026-11-02	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	46	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
33	2026-11-03 12:21:55.189036	admin@hrms.com	2026-11-03 12:21:55.189036	admin@hrms.com	12:21:55.184	\N	2026-11-03	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	46	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
34	2026-11-03 12:27:30.872603	hr@hrms.com	2026-11-03 12:27:30.872603	hr@hrms.com	12:27:30.872	\N	2026-11-03	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	3	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
35	2026-11-03 13:19:02.46667	manager@hrms.com	2026-11-03 13:19:02.46667	manager@hrms.com	13:19:02.447	\N	2026-11-03	Auto login after 09:30 AM	\N	Auto checked-in via portal login	LATE_ARRIVAL	\N	1	default	\N	\N	\N	\N	INSIDE_GEOFENCE	0:0:0:0:0:0:0:1	\N	\N	NONE	AUTO_LOGIN	\N	0	f	\N	OFFICE
\.


--
-- Data for Name: attendance_regularizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_regularizations (id, tenant_id, attendance_id, employee_id, date, requested_check_in, requested_check_out, reason, status, reviewer_id, reviewer_comments, reviewed_at, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, action, description, entity_id, entity_type, ip_address, module, new_values, old_values, performed_at, performed_by, request_id, tenant_id) FROM stdin;
1	EMPLOYEE_CREATED	Created employee QA Specialist	7	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 13:50:43.949429	SYSTEM	\N	default
2	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_9453@hrms.com)	7	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 13:50:44.281212	SYSTEM	\N	default
3	EMPLOYEE_CREATED	Created employee QA Specialist	8	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 13:56:20.835169	SYSTEM	\N	default
4	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_7467@hrms.com)	8	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 13:56:21.216014	SYSTEM	\N	default
5	EMPLOYEE_CREATED	Created employee QA Specialist	9	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:00:22.201835	SYSTEM	\N	default
6	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_1062@hrms.com)	9	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:00:22.544534	SYSTEM	\N	default
7	EMPLOYEE_CREATED	Created employee QA Specialist	11	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:02:00.140029	SYSTEM	\N	default
8	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_2786@hrms.com)	11	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:02:00.510025	SYSTEM	\N	default
9	EMPLOYEE_CREATED	Created employee QA Specialist	13	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:04:48.378299	SYSTEM	\N	default
10	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_6626@hrms.com)	13	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:04:48.725229	SYSTEM	\N	default
11	EMPLOYEE_CREATED	Created employee QA Specialist	15	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:06:29.098407	SYSTEM	\N	default
12	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_2610@hrms.com)	15	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 14:06:29.416411	SYSTEM	\N	default
13	EMPLOYEE_UPDATED	Updated employee chelikam  charan kumar (email: chelikamcharankumar@gmail.com)	5	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 16:38:50.78805	SYSTEM	\N	default
14	EMPLOYEE_CREATED	Created employee Vikram Sharma	17	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:19:50.731316	SYSTEM	\N	default
15	EMPLOYEE_CREATED	Created employee Vikram Sharma	18	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:20:44.96373	SYSTEM	\N	default
16	EMPLOYEE_CREATED	Created employee QA Specialist	19	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:21:02.119406	SYSTEM	\N	default
17	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_3818@hrms.com)	19	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:21:02.420716	SYSTEM	\N	default
18	EMPLOYEE_CREATED	Created employee QA Specialist	21	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:22:20.445375	SYSTEM	\N	default
19	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_4795@hrms.com)	21	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:22:20.845225	SYSTEM	\N	default
20	EMPLOYEE_CREATED	Created employee Vikram Sharma	23	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:23:39.765329	SYSTEM	\N	default
21	EMPLOYEE_CREATED	Created employee Vikram Sharma	24	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:24:16.445167	SYSTEM	\N	default
22	EMPLOYEE_CREATED	Created employee QA Specialist	25	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:24:33.461645	SYSTEM	\N	default
23	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_9574@hrms.com)	25	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-29 18:24:33.763993	SYSTEM	\N	default
24	EMPLOYEE_CREATED	Created employee Vikram Sharma	27	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 12:22:30.177723	SYSTEM	\N	default
25	EMPLOYEE_CREATED	Created employee Vikram Sharma	28	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 12:23:00.278816	SYSTEM	\N	default
26	EMPLOYEE_CREATED	Created employee QA Specialist	29	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 12:23:12.719156	SYSTEM	\N	default
27	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_6871@hrms.com)	29	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 12:23:13.051552	SYSTEM	\N	default
28	EMPLOYEE_CREATED	Created employee Vikram Sharma	31	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 13:24:21.133359	SYSTEM	\N	default
29	EMPLOYEE_CREATED	Created employee QA Specialist	32	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 13:24:42.423288	SYSTEM	\N	default
30	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_5379@hrms.com)	32	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 13:24:42.74795	SYSTEM	\N	default
31	EMPLOYEE_CREATED	Created employee QA Specialist	34	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 16:15:53.98496	SYSTEM	\N	default
32	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_7964@hrms.com)	34	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 16:15:54.301233	SYSTEM	\N	default
33	EMPLOYEE_CREATED	Created employee Vikram Sharma	36	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 16:58:29.422183	SYSTEM	\N	default
34	EMPLOYEE_CREATED	Created employee QA Specialist	37	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 16:58:54.131928	SYSTEM	\N	default
35	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_3569@hrms.com)	37	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 16:58:54.477698	SYSTEM	\N	default
36	EMPLOYEE_CREATED	Created employee QA Specialist	40	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 17:37:11.031811	SYSTEM	\N	default
37	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_4278@hrms.com)	40	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 17:37:11.349359	SYSTEM	\N	default
38	EMPLOYEE_CREATED	Created employee QA Specialist	42	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 18:47:01.271823	SYSTEM	\N	default
39	EMPLOYEE_UPDATED	Updated employee QA Lead (email: testqa_updated_6162@hrms.com)	42	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-10-30 18:47:01.585283	SYSTEM	\N	default
40	EMPLOYEE_CREATED	Created employee Vikram Sharma	44	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 12:10:50.805447	SYSTEM	\N	default
41	EMPLOYEE_CREATED	Created employee Vikram Sharma	45	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 12:11:38.470201	SYSTEM	\N	default
42	EMPLOYEE_PHOTO_UPLOAD	Uploaded profile picture for Priya Sharma	3	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 16:57:44.679701	SYSTEM	\N	default
43	EMPLOYEE_PHOTO_UPLOAD	Uploaded profile picture for System Admin	46	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 17:22:14.056942	SYSTEM	\N	default
44	EMPLOYEE_PHOTO_UPLOAD	Uploaded profile picture for System Admin	46	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 17:41:28.33867	SYSTEM	\N	default
45	EMPLOYEE_PHOTO_UPLOAD	Uploaded profile picture for Priya Sharma	3	EMPLOYEE	\N	EMPLOYEE	\N	\N	2026-11-02 18:17:14.302418	SYSTEM	\N	default
\.


--
-- Data for Name: biometric_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.biometric_devices (id, tenant_id, device_code, device_name, ip_address, location, is_active, last_sync_at, created_at, updated_at, created_by, updated_by) FROM stdin;
3	default	GATE-TEST-615	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 12:20:41.239819	2026-10-30 12:20:41.239819	admin@hrms.com	admin@hrms.com
4	default	GATE-TEST-701	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 12:22:18.930871	2026-10-30 12:22:18.930871	admin@hrms.com	admin@hrms.com
5	default	GATE-TEST-500	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 12:35:22.514718	2026-10-30 12:35:22.514718	admin@hrms.com	admin@hrms.com
6	default	GATE-TEST-163	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 13:24:34.152668	2026-10-30 13:24:34.152668	admin@hrms.com	admin@hrms.com
7	default	GATE-TEST-603	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 16:15:38.109465	2026-10-30 16:15:38.109465	admin@hrms.com	admin@hrms.com
8	default	GATE-TEST-903	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 16:29:39.608275	2026-10-30 16:29:39.608275	admin@hrms.com	admin@hrms.com
9	default	GATE-TEST-789	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 16:58:41.326315	2026-10-30 16:58:41.326315	admin@hrms.com	admin@hrms.com
10	default	GATE-TEST-475	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 17:36:57.400347	2026-10-30 17:36:57.400347	admin@hrms.com	admin@hrms.com
11	default	GATE-TEST-189	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-10-30 18:46:43.365467	2026-10-30 18:46:43.365467	admin@hrms.com	admin@hrms.com
12	default	GATE-TEST-196	Automated Test Turnstile	192.168.10.88	North Security Wing	t	\N	2026-11-02 12:10:43.414501	2026-11-02 12:10:43.414501	admin@hrms.com	admin@hrms.com
1	default	GATE-01	HQ Main Entrance Turnstile (Face/RFID)	\N	Ground Floor Lobby	t	2026-11-02 12:10:43.480031	2026-10-30 12:02:58.51388	2026-11-02 12:10:43.480031	\N	admin@hrms.com
2	default	GATE-02	Engineering Block Turnstile (Fingerprint)	\N	Building B Turnstile	t	2026-11-02 12:10:43.590846	2026-10-30 12:02:58.51388	2026-11-02 12:10:43.59128	\N	admin@hrms.com
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.candidates (id, created_at, created_by, updated_at, updated_by, current_ctc, email, expected_ctc, experience_years, linkedin_url, name, notes, notice_period_days, phone, rejection_reason, resume_url, source, stage, job_posting_id, referred_by, tenant_id) FROM stdin;
5	2026-10-29 11:54:47.353475	\N	\N	\N	1700000.00	vikram.sharma@example.com	2200000.00	6	\N	Vikram Sharma	Strong Spring Boot, Multi-tenancy, and Distributed Systems experience	30	+91 98765 43210	\N	\N	LinkedIn	INTERVIEW_ROUND_2	5	\N	default
9	2026-10-29 14:00:25.290685	hr@hrms.com	2026-10-29 14:00:25.593217	hr@hrms.com	\N	candidate_1062@example.com	75000.00	4	\N	Candidate 1062	Screened by QA | Converted to Employee: EMP-CONV-1062	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
10	2026-10-29 14:02:03.281193	hr@hrms.com	2026-10-29 14:02:03.579368	hr@hrms.com	\N	candidate_2786@example.com	75000.00	4	\N	Candidate 2786	Screened by QA | Converted to Employee: EMP-CONV-2786	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
11	2026-10-29 14:04:51.36135	hr@hrms.com	2026-10-29 14:04:51.651968	hr@hrms.com	\N	candidate_6626@example.com	75000.00	4	\N	Candidate 6626	Screened by QA | Converted to Employee: EMP-CONV-6626	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
12	2026-10-29 14:06:31.725241	hr@hrms.com	2026-10-29 14:06:32.017464	hr@hrms.com	\N	candidate_2610@example.com	75000.00	4	\N	Candidate 2610	Screened by QA | Converted to Employee: EMP-CONV-2610	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
13	2026-10-29 18:21:04.684938	hr@hrms.com	2026-10-29 18:21:04.99124	hr@hrms.com	\N	candidate_3818@example.com	75000.00	4	\N	Candidate 3818	Screened by QA | Converted to Employee: EMP-CONV-3818	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
14	2026-10-29 18:22:23.733066	hr@hrms.com	2026-10-29 18:22:24.050749	hr@hrms.com	\N	candidate_4795@example.com	75000.00	4	\N	Candidate 4795	Screened by QA | Converted to Employee: EMP-CONV-4795	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
15	2026-10-29 18:24:36.425734	hr@hrms.com	2026-10-29 18:24:36.708734	hr@hrms.com	\N	candidate_9574@example.com	75000.00	4	\N	Candidate 9574	Screened by QA | Converted to Employee: EMP-CONV-9574	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
16	2026-10-30 12:23:15.52558	hr@hrms.com	2026-10-30 12:23:15.814205	hr@hrms.com	\N	candidate_6871@example.com	75000.00	4	\N	Candidate 6871	Screened by QA | Converted to Employee: EMP-CONV-6871	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
17	2026-10-30 13:24:45.246606	hr@hrms.com	2026-10-30 13:24:45.543394	hr@hrms.com	\N	candidate_5379@example.com	75000.00	4	\N	Candidate 5379	Screened by QA | Converted to Employee: EMP-CONV-5379	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
18	2026-10-30 16:15:56.912572	hr@hrms.com	2026-10-30 16:15:57.219263	hr@hrms.com	\N	candidate_7964@example.com	75000.00	4	\N	Candidate 7964	Screened by QA | Converted to Employee: EMP-CONV-7964	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
19	2026-10-30 16:58:57.010709	hr@hrms.com	2026-10-30 16:58:57.308646	hr@hrms.com	\N	candidate_3569@example.com	75000.00	4	\N	Candidate 3569	Screened by QA | Converted to Employee: EMP-CONV-3569	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
7	2026-10-29 11:54:47.353475	\N	2026-10-30 17:33:02.788174	hr@hrms.com	1300000.00	rohan.mehta@example.com	1800000.00	5	\N	Rohan Mehta	Final interview cleared. Offer generated and pending candidate signature. | Converted to Employee: EMP-8844	30	+91 98450 12345	\N	\N	Direct	HIRED	6	\N	default
20	2026-10-30 17:37:13.889086	hr@hrms.com	2026-10-30 17:37:14.18664	hr@hrms.com	\N	candidate_4278@example.com	75000.00	4	\N	Candidate 4278	Screened by QA | Converted to Employee: EMP-CONV-4278	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
21	2026-10-30 18:47:04.050593	hr@hrms.com	2026-10-30 18:47:04.337246	hr@hrms.com	\N	candidate_6162@example.com	75000.00	4	\N	Candidate 6162	Screened by QA | Converted to Employee: EMP-CONV-6162	30	9876543219	\N	\N	Portal	HIRED	5	\N	default
6	2026-10-29 11:54:47.353475	\N	2026-11-03 13:26:55.680802	admin@hrms.com	1500000.00	ananya.deshmukh@example.com	2000000.00	4	\N	Ananya Deshmukh	Impressive database optimization and high concurrency portfolio	15	+91 98111 22334	\N	\N	Referral	INTERVIEW_ROUND_2	5	\N	default
22	2026-11-03 15:32:41.880003	hr@hrms.com	2026-11-03 15:33:49.520452	hr@hrms.com	\N	bapusomineni26@gmail.com	20000.00	0	\N	bapu somineni	\N	30	9704300435	\N	\N	Direct	INTERVIEW_ROUND_1	6	\N	default
\.


--
-- Data for Name: company_announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_announcements (id, tenant_id, title, content, category, priority, target_audience, department_id, pinned, author_id, published_at, expires_at, acknowledgment_required, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	Annual Global Town Hall & Q4 Technology Roadmap (4186)	Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives.	LEADERSHIP	IMPORTANT	ALL	\N	t	1	2026-10-30 16:54:19.209922	\N	t	2026-10-30 16:54:19.212918	2026-10-30 16:54:19.212918	admin@hrms.com	admin@hrms.com
2	default	Annual Global Town Hall & Q4 Technology Roadmap (1957)	Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives.	LEADERSHIP	IMPORTANT	ALL	\N	t	1	2026-10-30 16:58:22.679492	\N	t	2026-10-30 16:58:22.679492	2026-10-30 16:58:22.679492	admin@hrms.com	admin@hrms.com
3	default	Annual Global Town Hall & Q4 Technology Roadmap (3120)	Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives.	LEADERSHIP	IMPORTANT	ALL	\N	t	1	2026-10-30 17:37:03.083726	\N	t	2026-10-30 17:37:03.086883	2026-10-30 17:37:03.086883	admin@hrms.com	admin@hrms.com
4	default	Annual Global Town Hall & Q4 Technology Roadmap (6790)	Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives.	LEADERSHIP	IMPORTANT	ALL	\N	t	1	2026-10-30 18:46:34.167394	\N	t	2026-10-30 18:46:34.170389	2026-10-30 18:46:34.170389	admin@hrms.com	admin@hrms.com
5	default	Annual Global Town Hall & Q4 Technology Roadmap (1231)	Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives.	LEADERSHIP	IMPORTANT	ALL	\N	t	1	2026-11-02 12:10:34.897624	\N	t	2026-11-02 12:10:34.900664	2026-11-02 12:10:34.900664	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, created_at, created_by, updated_at, updated_by, budget, code, deleted, description, is_active, location, name, manager_id, tenant_id) FROM stdin;
1	2026-10-28 13:00:54.626573	SYSTEM	2026-10-28 13:00:54.626573	SYSTEM	15000000	ENG	f	Software development and architecture	t	Bangalore	Engineering	\N	default
2	2026-10-28 13:00:54.671849	SYSTEM	2026-10-28 13:00:54.671849	SYSTEM	5000000	HR	f	Talent acquisition and culture	t	Mumbai	Human Resources	\N	default
3	2026-10-28 13:00:54.672882	SYSTEM	2026-10-28 13:00:54.672882	SYSTEM	8000000	FIN	f	Payroll and treasury	t	Delhi	Finance	\N	default
4	2026-10-28 13:00:54.67388	SYSTEM	2026-10-28 13:00:54.67388	SYSTEM	6000000	MKT	f	Brand and growth	t	Bangalore	Marketing	\N	default
5	2026-10-29 13:43:42.362258	admin@hrms.com	2026-10-29 13:43:42.362258	admin@hrms.com	\N	QE9130	f	Enterprise Automated Testing	t	\N	Quality Engineering 9130	\N	default
6	2026-10-29 13:50:46.272195	admin@hrms.com	2026-10-29 13:50:46.272195	admin@hrms.com	\N	QE9453	f	Enterprise Automated Testing	t	\N	Quality Engineering 9453	\N	default
7	2026-10-29 13:56:23.196335	admin@hrms.com	2026-10-29 13:56:23.196335	admin@hrms.com	\N	QE7467	f	Enterprise Automated Testing	t	\N	Quality Engineering 7467	\N	default
8	2026-10-29 14:00:24.550838	admin@hrms.com	2026-10-29 14:00:24.550838	admin@hrms.com	\N	QE1062	f	Enterprise Automated Testing	t	\N	Quality Engineering 1062	\N	default
9	2026-10-29 14:02:02.558	admin@hrms.com	2026-10-29 14:02:02.558	admin@hrms.com	\N	QE2786	f	Enterprise Automated Testing	t	\N	Quality Engineering 2786	\N	default
10	2026-10-29 14:04:50.713277	admin@hrms.com	2026-10-29 14:04:50.713277	admin@hrms.com	\N	QE6626	f	Enterprise Automated Testing	t	\N	Quality Engineering 6626	\N	default
11	2026-10-29 14:06:31.346851	admin@hrms.com	2026-10-29 14:06:31.346851	admin@hrms.com	\N	QE2610	f	Enterprise Automated Testing	t	\N	Quality Engineering 2610	\N	default
12	2026-10-29 18:21:04.147383	admin@hrms.com	2026-10-29 18:21:04.147383	admin@hrms.com	\N	QE3818	f	Enterprise Automated Testing	t	\N	Quality Engineering 3818	\N	default
13	2026-10-29 18:22:22.89791	admin@hrms.com	2026-10-29 18:22:22.89791	admin@hrms.com	\N	QE4795	f	Enterprise Automated Testing	t	\N	Quality Engineering 4795	\N	default
14	2026-10-29 18:24:35.725365	admin@hrms.com	2026-10-29 18:24:35.725365	admin@hrms.com	\N	QE9574	f	Enterprise Automated Testing	t	\N	Quality Engineering 9574	\N	default
15	2026-10-30 12:23:15.015371	admin@hrms.com	2026-10-30 12:23:15.015371	admin@hrms.com	\N	QE6871	f	Enterprise Automated Testing	t	\N	Quality Engineering 6871	\N	default
16	2026-10-30 13:24:44.711076	admin@hrms.com	2026-10-30 13:24:44.711076	admin@hrms.com	\N	QE5379	f	Enterprise Automated Testing	t	\N	Quality Engineering 5379	\N	default
17	2026-10-30 16:15:56.319387	admin@hrms.com	2026-10-30 16:15:56.319387	admin@hrms.com	\N	QE7964	f	Enterprise Automated Testing	t	\N	Quality Engineering 7964	\N	default
18	2026-10-30 16:58:56.431495	admin@hrms.com	2026-10-30 16:58:56.431495	admin@hrms.com	\N	QE3569	f	Enterprise Automated Testing	t	\N	Quality Engineering 3569	\N	default
19	2026-10-30 17:37:13.339944	admin@hrms.com	2026-10-30 17:37:13.339944	admin@hrms.com	\N	QE4278	f	Enterprise Automated Testing	t	\N	Quality Engineering 4278	\N	default
20	2026-10-30 18:47:03.552154	admin@hrms.com	2026-10-30 18:47:03.552154	admin@hrms.com	\N	QE6162	f	Enterprise Automated Testing	t	\N	Quality Engineering 6162	\N	default
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_documents (id, tenant_id, employee_id, category, title, document_number, file_path, file_name, file_size, mime_type, issue_date, expiry_date, status, verified_by, verified_at, verification_remarks, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	2	HR_LETTER	BONAFIDE Letter	HR-LTR-35522	default/letters/2/3db0a870-48ab-4091-8289-42ea7f27950b_bonafide_letter_EMP-DEV-002.txt	bonafide_letter_EMP-DEV-002.txt	893	text/plain	2026-10-28	\N	VERIFIED	\N	\N	\N	2026-10-28 17:48:55.526758	2026-10-28 17:48:55.526758	admin@hrms.com	admin@hrms.com
2	default	2	HR_LETTER	BONAFIDE Letter	HR-LTR-66223	default/letters/2/008030fe-ab8d-4b26-b04b-a92c6528f994_bonafide_letter_EMP-DEV-002.txt	bonafide_letter_EMP-DEV-002.txt	893	text/plain	2026-10-28	\N	VERIFIED	\N	\N	\N	2026-10-28 17:49:26.223291	2026-10-28 17:49:26.223291	admin@hrms.com	admin@hrms.com
3	default	5	HR_LETTER	EMPLOYMENT VERIFICATION Letter	HR-LTR-79454	default/letters/5/4059a8e7-d67f-4d2d-91a6-86ae1a9dad8a_employment_verification_letter_EMP-2026-0005.txt	employment_verification_letter_EMP-2026-0005.txt	888	text/plain	2026-10-29	\N	VERIFIED	\N	\N	\N	2026-10-29 18:27:59.460091	2026-10-29 18:27:59.460091	chelikamcharankumar@gmail.com	chelikamcharankumar@gmail.com
\.


--
-- Data for Name: employee_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_goals (id, tenant_id, cycle_id, employee_id, title, description, metric_target, metric_current, weightage, progress, status, created_at, updated_at, created_by, updated_by) FROM stdin;
2	default	1	1	Modernize Microservices Architecture	Complete Phase 3 Package-by-Feature decoupling and containerization.	100% Modules	90% Modules	35	90	IN_PROGRESS	2026-10-29 11:54:08.033569	\N	\N	\N
3	default	1	1	Mentor Junior Developers & Lead Code Reviews	Conduct bi-weekly architectural knowledge transfer sessions.	12 Sessions	9 Sessions	30	75	IN_PROGRESS	2026-10-29 11:54:08.033569	\N	\N	\N
1	default	1	1	Improve API Reliability & SLA	Achieve 99.95% API uptime across all microservices and reduce p99 response times.	99.95% Uptime	99.91% Uptime	35	75	IN_PROGRESS	2026-10-29 11:54:08.033569	2026-10-29 13:01:57.879732	\N	admin@hrms.com
\.


--
-- Data for Name: employee_leave_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_leave_balances (id, tenant_id, employee_id, leave_type, allocated_days, used_days, pending_days, balance_days, year, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	4	ANNUAL	18.00	0.00	0.00	18.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
2	default	2	ANNUAL	18.00	0.00	0.00	18.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
3	default	3	ANNUAL	18.00	0.00	0.00	18.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
4	default	1	ANNUAL	18.00	0.00	0.00	18.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
5	default	4	CASUAL	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
7	default	3	CASUAL	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
8	default	1	CASUAL	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
9	default	4	SICK	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
10	default	2	SICK	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
11	default	3	SICK	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
12	default	1	SICK	12.00	0.00	0.00	12.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
13	default	4	MATERNITY	180.00	0.00	0.00	180.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
14	default	2	MATERNITY	180.00	0.00	0.00	180.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
15	default	3	MATERNITY	180.00	0.00	0.00	180.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
16	default	1	MATERNITY	180.00	0.00	0.00	180.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
17	default	4	PATERNITY	15.00	0.00	0.00	15.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
18	default	2	PATERNITY	15.00	0.00	0.00	15.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
19	default	3	PATERNITY	15.00	0.00	0.00	15.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
20	default	1	PATERNITY	15.00	0.00	0.00	15.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
21	default	4	UNPAID	30.00	0.00	0.00	30.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
22	default	2	UNPAID	30.00	0.00	0.00	30.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
23	default	3	UNPAID	30.00	0.00	0.00	30.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
24	default	1	UNPAID	30.00	0.00	0.00	30.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:48:33.871156	\N	\N
6	default	2	CASUAL	12.00	2.00	0.00	10.00	2026	2026-10-28 17:48:33.871156	2026-10-28 17:49:26.098585	\N	hr@hrms.com
\.


--
-- Data for Name: employee_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_requests (id, tenant_id, employee_id, request_type, title, description, start_date, end_date, amount, attachment_url, status, current_step, approver_comments, reviewed_by, reviewed_at, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	2	WORK_FROM_HOME	Remote day for home fiber maintenance	Available on Slack and email all day	2026-10-30	2026-10-30	\N	\N	APPROVED	1	Approved	\N	2026-10-29 13:05:06.850504	2026-10-28 17:49:26.189282	2026-10-29 13:05:06.882821	emp@hrms.com	admin@hrms.com
4	default	9	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 14:00:25.081844	2026-10-29 14:00:25.081844	testqa_updated_1062@hrms.com	testqa_updated_1062@hrms.com
5	default	11	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 14:02:03.055337	2026-10-29 14:02:03.055337	testqa_updated_2786@hrms.com	testqa_updated_2786@hrms.com
6	default	13	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 14:04:51.159807	2026-10-29 14:04:51.159807	testqa_updated_6626@hrms.com	testqa_updated_6626@hrms.com
7	default	15	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 14:06:31.591894	2026-10-29 14:06:31.591894	testqa_updated_2610@hrms.com	testqa_updated_2610@hrms.com
8	default	21	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 18:22:23.500886	2026-10-29 18:22:23.500886	testqa_updated_4795@hrms.com	testqa_updated_4795@hrms.com
9	default	25	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-29 18:24:36.182372	2026-10-29 18:24:36.182372	testqa_updated_9574@hrms.com	testqa_updated_9574@hrms.com
2	default	7	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-03-15	2026-03-16	\N	\N	APPROVED	1	Approved	\N	2026-10-29 18:35:31.191656	2026-10-29 13:50:46.633567	2026-10-29 18:35:31.210153	testqa_updated_9453@hrms.com	hr@hrms.com
3	default	8	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-03-15	2026-03-16	\N	\N	APPROVED	1	Approved	\N	2026-10-29 18:35:33.975924	2026-10-29 13:56:23.567094	2026-10-29 18:35:33.983258	testqa_updated_7467@hrms.com	hr@hrms.com
10	default	29	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 12:23:15.359476	2026-10-30 12:23:15.359476	testqa_updated_6871@hrms.com	testqa_updated_6871@hrms.com
11	default	32	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 13:24:45.070864	2026-10-30 13:24:45.070864	testqa_updated_5379@hrms.com	testqa_updated_5379@hrms.com
12	default	34	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 16:15:56.726936	2026-10-30 16:15:56.726936	testqa_updated_7964@hrms.com	testqa_updated_7964@hrms.com
13	default	37	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 16:58:56.820929	2026-10-30 16:58:56.820929	testqa_updated_3569@hrms.com	testqa_updated_3569@hrms.com
14	default	40	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 17:37:13.736822	2026-10-30 17:37:13.736822	testqa_updated_4278@hrms.com	testqa_updated_4278@hrms.com
15	default	42	WORK_FROM_HOME	Remote Automated Testing	Regression verification	2026-11-15	2026-11-16	\N	\N	PENDING	1	\N	\N	\N	2026-10-30 18:47:03.900303	2026-10-30 18:47:03.900303	testqa_updated_6162@hrms.com	testqa_updated_6162@hrms.com
\.


--
-- Data for Name: employee_separations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_separations (id, tenant_id, employee_id, resignation_date, requested_last_working_day, approved_last_working_day, reason, separation_type, status, reviewer_id, reviewer_comments, exit_interview_notes, created_at, updated_at, created_by, updated_by) FROM stdin;
7	default	41	2026-10-30	2027-01-28	2026-12-29	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-10-30 18:46:51.710794	2026-10-30 18:46:52.00494	admin@hrms.com	admin@hrms.com
2	default	30	2026-10-30	2027-01-28	2026-12-29	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-10-30 13:24:15.815205	2026-10-30 13:24:16.303481	admin@hrms.com	admin@hrms.com
3	default	33	2026-10-30	2027-01-28	2026-12-29	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-10-30 16:15:44.966264	2026-10-30 16:15:45.39575	admin@hrms.com	admin@hrms.com
4	default	35	2026-10-30	2027-01-28	2026-12-29	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-10-30 16:29:27.50423	2026-10-30 16:29:27.792034	admin@hrms.com	admin@hrms.com
5	default	36	2026-10-30	2027-01-28	2026-12-29	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-10-30 16:58:46.57833	2026-10-30 16:58:47.039296	admin@hrms.com	admin@hrms.com
8	default	43	2026-11-02	2027-01-31	2027-01-01	Pursuing advanced master's degree in cloud computing	RESIGNATION	SETTLED	1	Notice period buyout approved by management	\N	2026-11-02 12:10:27.577979	2026-11-02 12:10:27.957496	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, created_at, created_by, updated_at, updated_by, address, alternate_phone, bank_account_number, bank_name, casual_leave_balance, city, country, date_of_birth, date_of_confirmation, date_of_joining, date_of_leaving, deleted, designation, email, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, employee_number, employment_status, esi_number, first_name, gender, ifsc_code, job_title, last_name, last_working_date, leave_balance, pan_number, pf_number, phone_number, pincode, profile_picture_url, resume_url, salary, shift_type, sick_leave_balance, state, department_id, manager_id, user_id, tenant_id) FROM stdin;
1	2026-10-28 17:48:33.871156	\N	\N	\N	\N	\N	\N	\N	10	\N	\N	\N	\N	2023-01-15	\N	f	Engineering Manager	manager@hrms.com	\N	\N	\N	EMP-MGR-001	ACTIVE	\N	Vikram	\N	\N	\N	Singh	\N	20	\N	\N	\N	\N	\N	\N	\N	MORNING	10	\N	1	\N	3	default
2	2026-10-28 17:48:33.871156	\N	\N	\N	\N	\N	\N	\N	10	\N	\N	\N	\N	2024-03-01	\N	f	Senior Software Engineer	emp@hrms.com	\N	\N	\N	EMP-DEV-002	ACTIVE	\N	Rahul	\N	\N	\N	Kumar	\N	18	\N	\N	\N	\N	\N	\N	\N	MORNING	8	\N	1	1	4	default
4	2026-10-28 17:48:33.871156	\N	\N	\N	\N	\N	\N	\N	12	\N	\N	\N	\N	2024-01-10	\N	f	Lead Full Stack Engineer	bapanaidusomineni@gmail.com	\N	\N	\N	EMP-DEV-004	ACTIVE	\N	Bapanaidu	\N	\N	\N	Somineni	\N	25	\N	\N	\N	\N	\N	\N	\N	MORNING	13	\N	1	1	5	default
6	2026-10-29 13:43:39.714573	hr@hrms.com	2026-10-29 13:43:40.390749	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_9130@hrms.com	\N	\N	\N	EMP-2026-0006	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	8	default
7	2026-10-29 13:50:43.939023	hr@hrms.com	2026-10-29 13:50:44.281718	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_9453@hrms.com	\N	\N	\N	EMP-2026-0007	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	10	default
8	2026-10-29 13:56:20.822638	hr@hrms.com	2026-10-29 13:56:21.21652	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_7467@hrms.com	\N	\N	\N	EMP-2026-0008	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	12	default
9	2026-10-29 14:00:22.193665	hr@hrms.com	2026-10-29 14:00:22.544534	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_1062@hrms.com	\N	\N	\N	EMP-2026-0009	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	14	default
10	2026-10-29 14:00:25.590881	hr@hrms.com	2026-10-29 14:00:25.590881	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_1062@example.com	\N	\N	\N	EMP-CONV-1062	ACTIVE	\N	Candidate	\N	\N	\N	1062	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	15	default
11	2026-10-29 14:02:00.128078	hr@hrms.com	2026-10-29 14:02:00.511023	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_2786@hrms.com	\N	\N	\N	EMP-2026-0011	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	17	default
12	2026-10-29 14:02:03.576825	hr@hrms.com	2026-10-29 14:02:03.576825	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_2786@example.com	\N	\N	\N	EMP-CONV-2786	ACTIVE	\N	Candidate	\N	\N	\N	2786	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	18	default
13	2026-10-29 14:04:48.369414	hr@hrms.com	2026-10-29 14:04:48.725932	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_6626@hrms.com	\N	\N	\N	EMP-2026-0013	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	20	default
14	2026-10-29 14:04:51.647449	hr@hrms.com	2026-10-29 14:04:51.647449	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_6626@example.com	\N	\N	\N	EMP-CONV-6626	ACTIVE	\N	Candidate	\N	\N	\N	6626	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	21	default
15	2026-10-29 14:06:29.095782	hr@hrms.com	2026-10-29 14:06:29.416411	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_2610@hrms.com	\N	\N	\N	EMP-2026-0015	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	23	default
16	2026-10-29 14:06:32.014565	hr@hrms.com	2026-10-29 14:06:32.014565	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_2610@example.com	\N	\N	\N	EMP-CONV-2610	ACTIVE	\N	Candidate	\N	\N	\N	2610	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	24	default
5	2026-10-29 13:16:54.204653	hr@hrms.com	2026-10-29 16:56:48.24207	hr@hrms.com	nagavara	\N	321045697	HDFC 	8	Bengaluru	India	2002-09-23	\N	2026-10-29	\N	f	software engineer	chelikamcharankumar@gmail.com		\N		EMP-2026-0005	ACTIVE	\N	chelikam 	MALE	HDFC001234	Bacckend Engineer	charan kumar	\N	23	\N	\N	9874563218	560032	\N	\N	65000.00	MORNING	12	Karnataka	1	\N	6	default
17	2026-10-29 18:19:50.72179	admin@hrms.com	2026-10-29 18:19:50.72179	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-29	\N	f	Lead Cloud Architect	mnc_emp_3539@hrms.com	\N	\N	\N	EMP-2026-0017	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876543539	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	25	default
18	2026-10-29 18:20:44.961385	admin@hrms.com	2026-10-29 18:20:44.961385	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-29	\N	f	Lead Cloud Architect	mnc_emp_7782@hrms.com	\N	\N	\N	EMP-2026-0018	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876547782	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	26	default
19	2026-10-29 18:21:02.116986	hr@hrms.com	2026-10-29 18:21:02.420716	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_3818@hrms.com	\N	\N	\N	EMP-2026-0019	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	28	default
20	2026-10-29 18:21:04.988238	hr@hrms.com	2026-10-29 18:21:04.988238	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_3818@example.com	\N	\N	\N	EMP-CONV-3818	ACTIVE	\N	Candidate	\N	\N	\N	3818	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	29	default
21	2026-10-29 18:22:20.433434	hr@hrms.com	2026-10-29 18:22:20.845225	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_4795@hrms.com	\N	\N	\N	EMP-2026-0021	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	31	default
22	2026-10-29 18:22:24.047557	hr@hrms.com	2026-10-29 18:22:24.047557	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_4795@example.com	\N	\N	\N	EMP-CONV-4795	ACTIVE	\N	Candidate	\N	\N	\N	4795	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	32	default
23	2026-10-29 18:23:39.75582	admin@hrms.com	2026-10-29 18:23:39.75582	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-29	\N	f	Lead Cloud Architect	mnc_emp_5340@hrms.com	\N	\N	\N	EMP-2026-0023	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876545340	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	33	default
24	2026-10-29 18:24:16.442491	admin@hrms.com	2026-10-29 18:24:16.442491	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-29	\N	f	Lead Cloud Architect	mnc_emp_6455@hrms.com	\N	\N	\N	EMP-2026-0024	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876546455	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	34	default
25	2026-10-29 18:24:33.458046	hr@hrms.com	2026-10-29 18:24:33.763993	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_9574@hrms.com	\N	\N	\N	EMP-2026-0025	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	36	default
26	2026-10-29 18:24:36.704418	hr@hrms.com	2026-10-29 18:24:36.704418	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_9574@example.com	\N	\N	\N	EMP-CONV-9574	ACTIVE	\N	Candidate	\N	\N	\N	9574	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	37	default
27	2026-10-30 12:22:30.169768	admin@hrms.com	2026-10-30 12:22:30.169768	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-30	\N	f	Lead Cloud Architect	mnc_emp_1759@hrms.com	\N	\N	\N	EMP-2026-0027	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876541759	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	38	default
28	2026-10-30 12:23:00.275251	admin@hrms.com	2026-10-30 12:23:00.275251	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-30	\N	f	Lead Cloud Architect	mnc_emp_3717@hrms.com	\N	\N	\N	EMP-2026-0028	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876543717	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	39	default
29	2026-10-30 12:23:12.717025	hr@hrms.com	2026-10-30 12:23:13.051552	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_6871@hrms.com	\N	\N	\N	EMP-2026-0029	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	41	default
31	2026-10-30 13:24:21.126379	admin@hrms.com	2026-10-30 13:24:21.126379	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-30	\N	f	Lead Cloud Architect	mnc_emp_7411@hrms.com	\N	\N	\N	EMP-2026-0031	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876547411	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	43	default
30	2026-10-30 12:23:15.810892	hr@hrms.com	2026-10-30 13:20:20.509913	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	2026-12-29	f	QA Analyst	candidate_6871@example.com	\N	\N	\N	EMP-CONV-6871	TERMINATED	\N	Candidate	\N	\N	\N	6871	2026-12-29	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	42	default
32	2026-10-30 13:24:42.42174	hr@hrms.com	2026-10-30 13:24:42.74795	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_5379@hrms.com	\N	\N	\N	EMP-2026-0032	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	45	default
33	2026-10-30 13:24:45.540362	hr@hrms.com	2026-10-30 16:15:45.396277	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	2026-12-29	f	QA Analyst	candidate_5379@example.com	\N	\N	\N	EMP-CONV-5379	TERMINATED	\N	Candidate	\N	\N	\N	5379	2026-12-29	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	46	default
34	2026-10-30 16:15:53.972947	hr@hrms.com	2026-10-30 16:15:54.301233	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_7964@hrms.com	\N	\N	\N	EMP-2026-0034	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	48	default
35	2026-10-30 16:15:57.216777	hr@hrms.com	2026-10-30 16:29:27.792648	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	2026-12-29	f	QA Analyst	candidate_7964@example.com	\N	\N	\N	EMP-CONV-7964	TERMINATED	\N	Candidate	\N	\N	\N	7964	2026-12-29	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	49	default
36	2026-10-30 16:58:29.407493	admin@hrms.com	2026-10-30 16:58:47.039296	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-10-30	2026-12-29	f	Lead Cloud Architect	mnc_emp_5453@hrms.com	\N	\N	\N	EMP-2026-0036	TERMINATED	\N	Vikram	\N	\N	\N	Sharma	2026-12-29	24	\N	\N	9876545453	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	50	default
37	2026-10-30 16:58:54.129475	hr@hrms.com	2026-10-30 16:58:54.477698	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_3569@hrms.com	\N	\N	\N	EMP-2026-0037	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	52	default
38	2026-10-30 16:58:57.305834	hr@hrms.com	2026-10-30 16:58:57.305834	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	\N	f	QA Analyst	candidate_3569@example.com	\N	\N	\N	EMP-CONV-3569	ACTIVE	\N	Candidate	\N	\N	\N	3569	\N	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	53	default
39	2026-10-30 17:33:02.78404	hr@hrms.com	2026-10-30 17:33:02.78404	hr@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-15	\N	f	Frontend UI/UX Architect	rohan.mehta@example.com	\N	\N	\N	EMP-8844	ACTIVE	\N	Rohan	\N	\N	\N	Mehta	\N	24	\N	\N	+91 98450 12345	\N	\N	\N	1800000.00	MORNING	12	\N	1	\N	54	default
40	2026-10-30 17:37:11.024602	hr@hrms.com	2026-10-30 17:37:11.349359	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_4278@hrms.com	\N	\N	\N	EMP-2026-0040	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	56	default
41	2026-10-30 17:37:14.18361	hr@hrms.com	2026-10-30 17:37:19.705115	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	2026-12-29	f	QA Analyst	candidate_4278@example.com	\N	\N	\N	EMP-CONV-4278	TERMINATED	\N	Candidate	\N	\N	\N	4278	2026-12-29	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	57	default
42	2026-10-30 18:47:01.259383	hr@hrms.com	2026-10-30 18:47:01.585283	hr@hrms.com	\N	\N	998811223344	HDFC Bank	8	\N	\N	\N	\N	2026-02-01	\N	f	Senior Automation Lead	testqa_updated_6162@hrms.com	\N	\N	\N	EMP-2026-0042	ACTIVE	\N	QA	\N	HDFC0001234	\N	Lead	\N	24	\N	\N	9988776655	\N	\N	\N	95000.00	MORNING	12	\N	\N	\N	59	default
43	2026-10-30 18:47:04.334281	hr@hrms.com	2026-11-02 12:10:27.957496	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-01	2027-01-01	f	QA Analyst	candidate_6162@example.com	\N	\N	\N	EMP-CONV-6162	TERMINATED	\N	Candidate	\N	\N	\N	6162	2027-01-01	24	\N	\N	9876543219	\N	\N	\N	75000.00	MORNING	12	\N	1	\N	60	default
44	2026-11-02 12:10:50.788964	admin@hrms.com	2026-11-02 12:10:50.788964	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-02	\N	f	Lead Cloud Architect	mnc_emp_5274@hrms.com	\N	\N	\N	EMP-2026-0044	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876545274	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	61	default
45	2026-11-02 12:11:38.468056	admin@hrms.com	2026-11-02 12:11:38.468056	admin@hrms.com	\N	\N	\N	\N	8	\N	\N	\N	\N	2026-11-02	\N	f	Lead Cloud Architect	mnc_emp_1132@hrms.com	\N	\N	\N	EMP-2026-0045	ACTIVE	\N	Vikram	\N	\N	\N	Sharma	\N	24	\N	\N	9876541132	\N	\N	\N	120000.00	MORNING	12	\N	\N	\N	62	default
46	2026-11-02 17:15:39.879127	\N	2026-11-02 17:41:28.339673	admin@hrms.com	\N	\N	\N	\N	12	\N	\N	\N	\N	2026-11-02	\N	f	System Administrator	admin@hrms.com	\N	\N	\N	EMP-ADM-0001	ACTIVE	\N	System	\N	\N	\N	Admin	\N	24	\N	\N	\N	\N	/api/uploads/profiles/a689b34c-016d-45d0-bd1d-0b8bc3f4b22e-profile_avatar.jpg	\N	\N	\N	12	\N	1	\N	1	default
3	2026-10-28 17:48:33.871156	\N	2026-11-02 18:17:14.303421	hr@hrms.com	\N	\N	\N	\N	12	\N	\N	\N	\N	2023-05-10	\N	f	HR Business Partner	hr@hrms.com	\N	\N	\N	EMP-HR-003	ACTIVE	\N	Priya	\N	\N	\N	Sharma	\N	22	\N	\N	\N	\N	/api/uploads/profiles/eada0645-ed1a-42f6-9bdd-802f1d85fe02-profile_avatar.jpg	\N	\N	MORNING	10	\N	2	\N	2	default
\.


--
-- Data for Name: expense_claims; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_claims (id, tenant_id, employee_id, claim_number, category, title, description, amount, expense_date, status, receipt_url, receipt_filename, manager_id, manager_remarks, manager_reviewed_at, finance_reviewer_id, finance_remarks, finance_reviewed_at, payroll_slip_id, disbursed_at, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	1	EXP-2026-0001	INTERNET_WFH	High-Speed Fiber Broadband - Hybrid Work	Monthly corporate broadband reimbursement for remote development and client support.	1499.00	2026-10-18	FINANCE_APPROVED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-11-02 15:41:29.319601	2026-11-02 15:41:29.319601	\N	\N
2	default	1	EXP-2026-0002	TRAVEL	Client Architecture Review - Metro Cab Fare	Client on-site visit for quarterly architecture sync & security briefing.	850.00	2026-10-23	MANAGER_APPROVED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-11-02 15:41:29.331462	2026-11-02 15:41:29.331462	\N	\N
3	default	1	EXP-2026-0003	CERTIFICATION	AWS Certified Solutions Architect Exam Fee	Annual enterprise upskilling certification program claim.	12500.00	2026-10-28	SUBMITTED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-11-02 15:41:29.332497	2026-11-02 15:41:29.332497	\N	\N
4	default	45	EXP-2026-0004	TRAVEL	Client Quarterly Architecture Summit Cab Fare	Cab fare for client site security and architectural review.	1850.50	2026-11-02	DISBURSED	https://storage.hrms.corp/receipts/cab_receipt_2026.pdf	cab_receipt_2026.pdf	\N	Travel confirmed and approved for client architecture summit.	2026-11-02 16:00:28.516093	\N	Valid tax invoice verified. Approved for monthly payroll reimbursement.	2026-11-02 16:00:28.547397	\N	2026-11-02 16:00:28.60818	2026-11-02 16:00:28.436659	2026-11-02 16:00:28.61203	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: flight_risk_evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flight_risk_evaluations (id, tenant_id, employee_id, risk_score, risk_level, primary_driver, driver_breakdown, retention_recommendation, evaluated_at, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	1	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.198217	2026-11-02 12:10:09.915913	admin@hrms.com	2026-11-02 12:10:10.202215	admin@hrms.com
2	default	3	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.203288	2026-11-02 12:10:09.930812	admin@hrms.com	2026-11-02 12:10:10.206801	admin@hrms.com
3	default	2	30	LOW	TENURE_FLIGHT_WINDOW	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 15, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.208803	2026-11-02 12:10:09.94294	admin@hrms.com	2026-11-02 12:10:10.212319	admin@hrms.com
4	default	4	30	LOW	TENURE_FLIGHT_WINDOW	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 15, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.214316	2026-11-02 12:10:09.949446	admin@hrms.com	2026-11-02 12:10:10.217415	admin@hrms.com
5	default	6	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.218416	2026-11-02 12:10:09.955452	admin@hrms.com	2026-11-02 12:10:10.221415	admin@hrms.com
6	default	7	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.222417	2026-11-02 12:10:09.961453	admin@hrms.com	2026-11-02 12:10:10.225922	admin@hrms.com
7	default	8	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.22693	2026-11-02 12:10:09.966357	admin@hrms.com	2026-11-02 12:10:10.229443	admin@hrms.com
8	default	9	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.23145	2026-11-02 12:10:09.971869	admin@hrms.com	2026-11-02 12:10:10.233449	admin@hrms.com
9	default	10	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.23648	2026-11-02 12:10:09.97741	admin@hrms.com	2026-11-02 12:10:10.23848	admin@hrms.com
10	default	11	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.240479	2026-11-02 12:10:09.981417	admin@hrms.com	2026-11-02 12:10:10.242991	admin@hrms.com
11	default	12	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.243991	2026-11-02 12:10:09.986934	admin@hrms.com	2026-11-02 12:10:10.24699	admin@hrms.com
12	default	13	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.248497	2026-11-02 12:10:09.992069	admin@hrms.com	2026-11-02 12:10:10.251504	admin@hrms.com
13	default	14	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.252505	2026-11-02 12:10:09.997264	admin@hrms.com	2026-11-02 12:10:10.255504	admin@hrms.com
14	default	15	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.256505	2026-11-02 12:10:10.000789	admin@hrms.com	2026-11-02 12:10:10.259503	admin@hrms.com
15	default	16	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.261008	2026-11-02 12:10:10.0063	admin@hrms.com	2026-11-02 12:10:10.263529	admin@hrms.com
16	default	5	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.265037	2026-11-02 12:10:10.0113	admin@hrms.com	2026-11-02 12:10:10.267045	admin@hrms.com
17	default	17	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.268551	2026-11-02 12:10:10.0163	admin@hrms.com	2026-11-02 12:10:10.271064	admin@hrms.com
18	default	18	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.273071	2026-11-02 12:10:10.020813	admin@hrms.com	2026-11-02 12:10:10.276071	admin@hrms.com
19	default	19	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.277071	2026-11-02 12:10:10.024327	admin@hrms.com	2026-11-02 12:10:10.279584	admin@hrms.com
20	default	20	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.280587	2026-11-02 12:10:10.029349	admin@hrms.com	2026-11-02 12:10:10.283971	admin@hrms.com
21	default	21	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.284971	2026-11-02 12:10:10.033362	admin@hrms.com	2026-11-02 12:10:10.289013	admin@hrms.com
22	default	22	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.29002	2026-11-02 12:10:10.037879	admin@hrms.com	2026-11-02 12:10:10.293018	admin@hrms.com
23	default	23	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.293018	2026-11-02 12:10:10.04288	admin@hrms.com	2026-11-02 12:10:10.296041	admin@hrms.com
24	default	24	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.29805	2026-11-02 12:10:10.046879	admin@hrms.com	2026-11-02 12:10:10.300048	admin@hrms.com
25	default	25	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.301048	2026-11-02 12:10:10.051394	admin@hrms.com	2026-11-02 12:10:10.304197	admin@hrms.com
26	default	26	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.306199	2026-11-02 12:10:10.056908	admin@hrms.com	2026-11-02 12:10:10.309278	admin@hrms.com
27	default	27	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.310819	2026-11-02 12:10:10.061936	admin@hrms.com	2026-11-02 12:10:10.31282	admin@hrms.com
28	default	28	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.314845	2026-11-02 12:10:10.066462	admin@hrms.com	2026-11-02 12:10:10.317853	admin@hrms.com
29	default	29	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.319855	2026-11-02 12:10:10.070977	admin@hrms.com	2026-11-02 12:10:10.323653	admin@hrms.com
30	default	31	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.325652	2026-11-02 12:10:10.074976	admin@hrms.com	2026-11-02 12:10:10.329197	admin@hrms.com
31	default	30	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.330205	2026-11-02 12:10:10.079491	admin@hrms.com	2026-11-02 12:10:10.33372	admin@hrms.com
32	default	32	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.33572	2026-11-02 12:10:10.083644	admin@hrms.com	2026-11-02 12:10:10.339234	admin@hrms.com
33	default	33	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.341235	2026-11-02 12:10:10.08865	admin@hrms.com	2026-11-02 12:10:10.344234	admin@hrms.com
34	default	34	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.345232	2026-11-02 12:10:10.092163	admin@hrms.com	2026-11-02 12:10:10.34874	admin@hrms.com
35	default	35	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.349747	2026-11-02 12:10:10.096671	admin@hrms.com	2026-11-02 12:10:10.352749	admin@hrms.com
36	default	36	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.354746	2026-11-02 12:10:10.100678	admin@hrms.com	2026-11-02 12:10:10.357919	admin@hrms.com
37	default	37	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.359917	2026-11-02 12:10:10.105196	admin@hrms.com	2026-11-02 12:10:10.36243	admin@hrms.com
38	default	38	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.364527	2026-11-02 12:10:10.109193	admin@hrms.com	2026-11-02 12:10:10.367526	admin@hrms.com
39	default	39	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.369032	2026-11-02 12:10:10.113702	admin@hrms.com	2026-11-02 12:10:10.37204	admin@hrms.com
40	default	40	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.374042	2026-11-02 12:10:10.118223	admin@hrms.com	2026-11-02 12:10:10.377041	admin@hrms.com
41	default	41	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.378549	2026-11-02 12:10:10.122738	admin@hrms.com	2026-11-02 12:10:10.381558	admin@hrms.com
42	default	42	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.383071	2026-11-02 12:10:10.127248	admin@hrms.com	2026-11-02 12:10:10.386576	admin@hrms.com
43	default	43	20	LOW	COMPENSATION_STAGNATION	{"attendanceScore": 5, "compensationScore": 5, "tenureScore": 5, "performanceScore": 5}	Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.	2026-11-02 12:10:10.387584	2026-11-02 12:10:10.131766	admin@hrms.com	2026-11-02 12:10:10.389583	admin@hrms.com
\.


--
-- Data for Name: full_and_final_settlements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.full_and_final_settlements (id, tenant_id, separation_id, employee_id, settlement_date, last_drawn_basic, tenure_years, earned_leave_balance, leave_encashment_amount, gratuity_amount, bonus_amount, prorated_salary_amount, notice_pay_recovery, asset_recovery_deduction, statutory_deductions, net_payable_amount, status, remarks, disbursed_at, transaction_reference, created_at, updated_at, created_by, updated_by) FROM stdin;
2	default	2	30	2026-10-30	37500.00	0.16	14	17500.00	0.00	0.00	70161.29	0.00	500.00	3950.00	83211.29	DISBURSED	Statutory F&F calculation auto-generated	2026-10-30 13:24:16.291774	FNF-TXN-1793346856291	2026-10-30 13:24:16.300083	2026-10-30 13:24:16.300083	admin@hrms.com	admin@hrms.com
3	default	3	33	2026-10-30	37500.00	0.16	14	17500.00	0.00	0.00	70161.29	0.00	500.00	3950.00	83211.29	DISBURSED	Statutory F&F calculation auto-generated	2026-10-30 16:15:45.388135	FNF-TXN-1793357145388	2026-10-30 16:15:45.393546	2026-10-30 16:15:45.393546	admin@hrms.com	admin@hrms.com
4	default	4	35	2026-10-30	37500.00	0.16	14	17500.00	0.00	0.00	70161.29	0.00	500.00	3950.00	83211.29	DISBURSED	Statutory F&F calculation auto-generated	2026-10-30 16:29:27.788601	FNF-TXN-1793357967788	2026-10-30 16:29:27.790635	2026-10-30 16:29:27.790635	admin@hrms.com	admin@hrms.com
5	default	5	36	2026-10-30	60000.00	0.16	14	28000.00	0.00	0.00	112258.06	0.00	500.00	6200.00	133558.06	DISBURSED	Statutory F&F calculation auto-generated	2026-10-30 16:58:47.032793	FNF-TXN-1793359727032	2026-10-30 16:58:47.037033	2026-10-30 16:58:47.037033	admin@hrms.com	admin@hrms.com
7	default	7	41	2026-10-30	37500.00	0.16	14	17500.00	0.00	0.00	70161.29	0.00	500.00	3950.00	83211.29	DISBURSED	Statutory F&F calculation auto-generated	2026-10-30 18:46:51.997297	FNF-TXN-1793366211997	2026-10-30 18:46:52.002907	2026-10-30 18:46:52.002907	admin@hrms.com	admin@hrms.com
8	default	8	43	2026-11-02	37500.00	0.17	14	17500.00	0.00	0.00	2419.35	0.00	500.00	3950.00	15469.35	DISBURSED	Statutory F&F calculation auto-generated	2026-11-02 12:10:27.938202	FNF-TXN-1793601627938	2026-11-02 12:10:27.945191	2026-11-02 12:10:27.945191	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: hr_policy_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hr_policy_articles (id, tenant_id, category, title, summary, content, keywords, action_label, action_route, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	LEAVE_AND_TIME_OFF	Annual Paid Time Off & Sick Leave Encashment Policy	Enterprise guidelines regarding annual privilege leaves, casual leaves, sick leave accumulation, and rollover limits.	Employees accrue 1.75 privilege leaves (PL) per completed calendar month, totaling 21 PLs per annum. A maximum of 15 unused PLs can be carried forward into the subsequent calendar year. Accumulated balances beyond 15 days are eligible for encashment during the annual March payroll or upon separation. Sick leave (10 days/annum) requires a medical certificate if consecutive absence exceeds 3 days.	leave, annual leave, sick leave, rollover, encashment, privilege leave, casual leave, time off, pto, vacation	Apply for Leave	/leaves	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
2	default	HEALTH_AND_INSURANCE	Group Health Insurance & Family Floater Scheme	Comprehensive corporate medical insurance covering inpatient hospitalisation, maternity benefits, and pre-existing ailments.	All confirmed full-time staff and their declared dependents (spouse, up to 2 children) are insured under the Tier-1 Group Mediclaim Floater Policy up to INR 7,50,000 per family unit. Cashless hospitalisation is supported across 9,000+ networked hospitals nationwide via MediBuddy/Paramount TPA. Critical illness supplemental cover and parental add-on schemes can be opted during the annual benefits open enrollment window in April.	insurance, health, medical, mediclaim, hospitalisation, tpa, cashless, dependents, parents, maternity cover, policy	View Benefits	/documents	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
3	default	STATUTORY_AND_TAX	Indian Statutory Tax Regimes (New vs Old) & Declarations	Regulatory tax deductions, HRA exemptions, Section 80C/80D investment proofs, and regime switching guidelines.	The New Tax Regime (Section 115BAC) serves as the default payroll withholding framework, featuring concessional tax slabs and standard deduction of INR 75,000. Employees wishing to declare under the Old Tax Regime must submit Rent Receipts (HRA under Sec 10(13A)), Home Loan Interest (Sec 24b), 80C instruments (PPF, ELSS, EPF up to INR 1.5L), and Medical Premium (80D up to INR 25K) before the statutory cut-off date (January 15). Form 16 Part A and B are issued by May 31.	tax, income tax, new regime, old regime, 80c, 80d, hra, tds, form 16, deductions, investment declaration, slab	Manage Tax Declarations	/payroll	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
4	default	ATTENDANCE_AND_SHIFTS	Rotational Shift Allowances & Shift Swap Protocols	Standard operational hours, overnight shift compensations, and mutual peer swap rules.	The standard workday comprises 9 operational hours including 60 minutes of breaks. Employees designated to the Night Shift (21:00 - 06:00) receive an automated Night Differential Allowance of INR 500 per logged shift, credited through monthly payroll. Shift swap requests require mutual peer acceptance followed by reporting manager sign-off at least 24 hours prior to shift commencement.	shift, night shift, allowance, roster, swap, rotational, working hours, attendance, night allowance, timing	View Team Roster	/shifts	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
5	default	COMPENSATION_AND_BENEFITS	Gratuity Eligibility & Statutory Severance Computation	Statutory formula and qualification criteria under Payment of Gratuity Act, 1972.	In compliance with the Payment of Gratuity Act, employees completing at least 4 years and 240 days of continuous service qualify for statutory gratuity upon retirement, resignation, or superannuation. Gratuity is calculated strictly using the formula: (15 * Last Drawn Basic Salary * Completed Years of Service) / 26. Gratuity up to INR 20,00,000 is fully exempt from income tax.	gratuity, settlement, severance, resignation, retirement, basic salary, calculation, tenure, offboarding	Offboarding Portal	/offboarding	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
6	default	CODE_OF_CONDUCT	POSH Policy (Prevention of Sexual Harassment at Workplace)	Zero-tolerance guidelines, Internal Committee (IC) constitution, and confidential redressal channels.	The organization upholds a zero-tolerance policy against any form of sexual harassment or discriminatory conduct at physical premises or digital workplaces. Complaints may be submitted in strict confidentiality directly to the Internal Committee (IC) via the Helpdesk portal or via email at posh@corporate.hrms. The committee is bound to initiate preliminary inquiry within 7 business days and conclude comprehensive hearings within 90 calendar days.	posh, harassment, grievance, safety, code of conduct, internal committee, ethics, discrimination, complaint	Raise Confidential Ticket	/helpdesk	t	2026-11-02 11:56:03.386173	SYSTEM	\N	\N
\.


--
-- Data for Name: interview_scorecards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interview_scorecards (id, tenant_id, candidate_id, interviewer_id, round_name, technical_rating, communication_rating, culture_fit_rating, recommendation, feedback, created_at, created_by, updated_at, updated_by, interview_session_id, integrity_score, integrity_summary) FROM stdin;
1	default	6	46	Technical Round 1	4	4	4	HIRE		2026-11-03 13:26:50.325847	admin@hrms.com	2026-11-03 15:14:06.71749	hr@hrms.com	1	70	{"tabSwitches":0,"blurEvents":1,"camera":"","audio":"","notes":""}
\.


--
-- Data for Name: interview_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interview_sessions (id, tenant_id, candidate_id, job_posting_id, interviewer_id, round_name, scheduled_start, scheduled_end, status, room_name, guest_access_token, guest_token_expiry, meeting_link, interviewer_joined_at, candidate_joined_at, completed_at, interview_notes, integrity_status, integrity_details, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	6	5	46	Technical Round 1	2026-11-03 08:30:00	2026-11-03 09:15:00	COMPLETED	room_default_c6_3cdf1470	74048f3868d146a69de1b0aa28545d881793691852395	2026-11-05 13:25:07.426866	http://localhost:5173/interview/guest/74048f3868d146a69de1b0aa28545d881793691852395	2026-11-03 13:23:41.404608	2026-11-03 13:26:46.078731	2026-11-03 15:14:06.760623	In-app native WebRTC evaluation. System design & coding.	PROXY_SUSPECT	{"tabSwitches":0,"blurEvents":1,"camera":"","audio":"","notes":""}	2026-11-03 13:14:12.401441	2026-11-03 15:14:06.762845	admin@hrms.com	hr@hrms.com
2	default	5	5	46	Technical Round 2 (Final)	2026-11-03 08:30:00	2026-11-03 09:15:00	IN_PROGRESS	room_default_c5_9fc5ce27	83dae271e19a4279b2fe07ce66822d5a1793692261207	2026-11-05 13:25:07.426866	http://localhost:5173/interview/guest/83dae271e19a4279b2fe07ce66822d5a1793692261207	2026-11-03 15:14:46.774255	\N	\N	In-app native WebRTC evaluation. System design & coding.	CLEAN	{"tabSwitches":0,"blurEvents":0,"deviceVerified":false}	2026-11-03 13:21:01.207039	2026-11-03 15:14:46.77931	admin@hrms.com	hr@hrms.com
3	default	22	6	3	Technical Round 1	2026-11-03 10:10:00	2026-11-03 10:40:00	SCHEDULED	room_default_c22_d228f7d1	ffb68e8f4f6f492f9bfb2abd6f1d59451793700229505	2026-11-05 10:40:00	http://localhost:5173/interview/guest/ffb68e8f4f6f492f9bfb2abd6f1d59451793700229505	\N	\N	\N		CLEAN	{"tabSwitches":0,"blurEvents":0,"deviceVerified":false}	2026-11-03 15:33:49.507633	2026-11-03 15:33:49.507633	hr@hrms.com	hr@hrms.com
4	default	22	6	46	Technical Round 1: Live Architecture Evaluation	2026-11-03 16:00:00	2026-11-03 16:45:00	SCHEDULED	room_default_c22_212f8e0d	a77ca98bca8a46fbb58abccde2366dda1793701149014	2026-11-05 16:45:00	http://localhost:5173/interview/guest/a77ca98bca8a46fbb58abccde2366dda1793701149014	\N	\N	\N	Native video interview testing with Gmail SMTP dispatch.	CLEAN	{"tabSwitches":0,"blurEvents":0,"deviceVerified":false}	2026-11-03 15:49:09.019756	2026-11-03 15:49:09.019756	admin@hrms.com	admin@hrms.com
5	default	22	6	46	Mobile & Desktop Video Interview	2026-11-03 16:30:00	2026-11-03 17:15:00	SCHEDULED	room_default_c22_dad3505e	dc95c67a9f25459eb120d08f94d8ebdb1793702841122	2026-11-05 17:15:00	http://192.168.0.140:5173/interview/guest/dc95c67a9f25459eb120d08f94d8ebdb1793702841122	\N	\N	\N	Testing phone access via local Wi-Fi network.	CLEAN	{"tabSwitches":0,"blurEvents":0,"deviceVerified":false}	2026-11-03 16:17:21.128206	2026-11-03 16:17:21.128206	admin@hrms.com	admin@hrms.com
6	default	22	6	46	Live Video Technical Interview	2026-11-03 17:00:00	2026-11-03 17:45:00	SCHEDULED	room_default_c22_5b126d77	bb1a60770d0244fc9ebad785b1ae49be1793704628812	2026-11-05 17:45:00	https://192.168.0.140:5173/interview/guest/bb1a60770d0244fc9ebad785b1ae49be1793704628812	\N	\N	\N	Testing real mobile camera and microphone over secure HTTPS.	CLEAN	{"tabSwitches":0,"blurEvents":0,"deviceVerified":false}	2026-11-03 16:47:08.818559	2026-11-03 16:47:08.818559	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: job_openings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_openings (id, tenant_id, department_id, title, description, openings_count, min_experience, max_experience, budget_min, budget_max, job_type, status, created_at, updated_at) FROM stdin;
1	default	1	Senior Cloud Platform Engineer	Lead our core multi-tenant microservices architecture on AWS and Kubernetes.	2	4	8	1800000.00	2600000.00	FULL_TIME	OPEN	2026-10-29 11:52:30.015867	\N
2	default	1	Frontend UI/UX Architect	Drive React 18, Tailwind, and Design System engineering across HR portals.	1	3	6	1400000.00	2000000.00	FULL_TIME	OPEN	2026-10-29 11:52:30.015867	\N
3	default	2	People Operations & Talent Specialist	Manage enterprise talent acquisition, recruitment pipelines, and onboarding.	1	2	5	800000.00	1200000.00	FULL_TIME	OPEN	2026-10-29 11:52:30.015867	\N
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_postings (id, created_at, created_by, updated_at, updated_by, closes_at, description, experience_max, experience_min, location, openings, requirements, salary_max, salary_min, status, title, department_id, hiring_manager_id, tenant_id) FROM stdin;
5	2026-10-29 11:54:32.715479	\N	\N	\N	\N	Lead our core multi-tenant microservices architecture on AWS and Kubernetes.	8	4	Bangalore HQ	2	5+ years Java/Spring Boot, Docker, K8s, AWS	2600000.00	1800000.00	OPEN	Senior Cloud Platform Engineer	1	\N	default
6	2026-10-29 11:54:32.715479	\N	\N	\N	\N	Drive React 18, Tailwind, and Design System engineering across HR portals.	6	3	Bangalore HQ	1	4+ years modern React, Redux Toolkit, Tailwind	2000000.00	1400000.00	OPEN	Frontend UI/UX Architect	1	\N	default
7	2026-10-29 11:54:32.715479	\N	\N	\N	\N	Manage enterprise talent acquisition, recruitment pipelines, and onboarding.	5	2	Hyderabad Centre	1	3+ years Tech Recruiting	1200000.00	800000.00	OPEN	People Operations Specialist	2	\N	default
\.


--
-- Data for Name: leave_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_policies (id, tenant_id, leave_type, annual_allowance, monthly_accrual_rate, max_carry_over, allows_half_day, requires_attachment, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	ANNUAL	18.00	1.50	10.00	t	f	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
2	default	CASUAL	12.00	1.00	0.00	t	f	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
3	default	SICK	12.00	1.00	5.00	t	t	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
4	default	MATERNITY	180.00	0.00	0.00	f	t	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
5	default	PATERNITY	15.00	0.00	0.00	f	t	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
6	default	UNPAID	30.00	0.00	0.00	t	f	t	2026-10-28 17:33:48.889271	2026-10-28 17:33:48.889271	\N	\N
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_requests (id, created_at, created_by, updated_at, updated_by, approver_comments, attachment_url, end_date, leave_type, number_of_days, reason, reviewed_at, start_date, status, employee_id, reviewed_by, tenant_id) FROM stdin;
1	2026-10-28 17:49:25.866044	emp@hrms.com	2026-10-28 17:49:26.095584	hr@hrms.com	HR verification completed. Leave granted.	\N	2026-11-03	CASUAL	2	Attending family wedding	2026-10-28 17:49:26.069358	2026-11-02	APPROVED	2	\N	default
2	2026-10-29 14:00:24.863386	testqa_updated_1062@hrms.com	2026-10-29 14:00:24.863386	testqa_updated_1062@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	9	\N	default
3	2026-10-29 14:02:02.822666	testqa_updated_2786@hrms.com	2026-10-29 14:02:02.822666	testqa_updated_2786@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	11	\N	default
4	2026-10-29 14:04:50.941988	testqa_updated_6626@hrms.com	2026-10-29 14:04:50.941988	testqa_updated_6626@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	13	\N	default
5	2026-10-29 14:06:31.483621	testqa_updated_2610@hrms.com	2026-10-29 14:06:31.483621	testqa_updated_2610@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	15	\N	default
7	2026-10-29 18:22:23.188062	testqa_updated_4795@hrms.com	2026-10-29 18:22:23.188062	testqa_updated_4795@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	21	\N	default
8	2026-10-29 18:24:35.961806	testqa_updated_9574@hrms.com	2026-10-29 18:24:35.961806	testqa_updated_9574@hrms.com	\N	\N	2026-11-04	CASUAL	2	QA Automation Leave Test	\N	2026-11-03	PENDING	25	\N	default
9	2026-10-29 19:04:29.281055	chelikamcharankumar@gmail.com	2026-10-30 10:51:09.234283	hr@hrms.com	Approved	\N	2026-10-31	UNPAID	0	unpaid	2026-10-30 10:51:09.201758	2026-10-31	APPROVED	5	\N	default
6	2026-10-29 16:56:15.865585	chelikamcharankumar@gmail.com	2026-10-30 10:51:30.82976	hr@hrms.com	Approved	\N	2026-10-30	SICK	1	sick	2026-10-30 10:51:30.819717	2026-10-30	APPROVED	5	2	default
10	2026-10-30 12:23:15.163218	testqa_updated_6871@hrms.com	2026-10-30 12:23:15.163218	testqa_updated_6871@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	29	\N	default
11	2026-10-30 13:24:44.883399	testqa_updated_5379@hrms.com	2026-10-30 13:24:44.883399	testqa_updated_5379@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	32	\N	default
12	2026-10-30 16:15:56.496969	testqa_updated_7964@hrms.com	2026-10-30 16:15:56.496969	testqa_updated_7964@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	34	\N	default
13	2026-10-30 16:58:56.648795	testqa_updated_3569@hrms.com	2026-10-30 16:58:56.648795	testqa_updated_3569@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	37	\N	default
14	2026-10-30 17:37:13.535134	testqa_updated_4278@hrms.com	2026-10-30 17:37:13.535134	testqa_updated_4278@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	40	\N	default
15	2026-10-30 18:47:03.721367	testqa_updated_6162@hrms.com	2026-10-30 18:47:03.721367	testqa_updated_6162@hrms.com	\N	\N	2026-11-05	CASUAL	2	QA Automation Leave Test	\N	2026-11-04	PENDING	42	\N	default
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.login_history (id, browser, device_type, ip_address, location, login_at, logout_at, os_name, session_id, status, user_agent, user_id, tenant_id) FROM stdin;
1	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 13:01:35.024379	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
8	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:29:39.888479	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	5	default
11	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:33:12.671177	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	5	default
12	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:55:04.549242	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
13	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:55:09.938085	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2	default
14	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:55:40.267728	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
15	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:55:47.053993	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
16	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:57:12.096839	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
17	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:57:18.808719	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2	default
18	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:57:25.668563	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
19	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:58:19.056055	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
20	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:58:56.217522	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
21	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:59:31.869829	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
22	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 15:59:45.341585	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
23	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:29:54.805267	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
24	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:29:55.321936	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2	default
25	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:29:55.670505	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	4	default
27	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:33:16.84651	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2	default
28	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:40:18.332147	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
29	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 16:44:21.283875	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2	default
30	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:47:55.116529	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
31	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:48:54.713599	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
34	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:49:24.827118	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
35	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:49:25.127205	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	4	default
36	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:49:25.407082	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	3	default
37	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 17:49:25.686458	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2	default
38	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 18:16:45.004197	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2	default
39	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 18:33:48.888849	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
40	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 18:39:32.62066	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
41	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-28 18:40:08.166292	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	1	default
42	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 11:18:08.13411	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
44	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 11:26:59.875806	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	4	default
45	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 11:34:16.529022	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	4	default
46	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 12:02:34.360446	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
47	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:01:32.990395	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	1	default
48	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:08:12.2	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
49	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:18:51.329578	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
50	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:19:00.685756	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
51	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:19:40.424969	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
52	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:20:28.805317	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
53	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:21:10.481964	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
54	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:37.157006	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
55	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:37.783766	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
56	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:38.185666	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
57	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:38.464122	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
59	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:40.19139	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	8	default
60	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:40.927035	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	8	default
62	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:43:42.293391	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	8	default
63	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:41.761274	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
64	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:42.275479	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
65	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:42.580584	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
66	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:42.882333	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
68	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:44.23709	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	10	default
69	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:44.818556	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	10	default
71	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:50:46.149785	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	10	default
72	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:53:27.629557	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
73	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:53:42.888094	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
74	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:18.724146	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
75	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:19.216923	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
76	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:19.497923	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
77	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:19.776379	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
79	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:21.17047	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	12	default
80	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:21.744037	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	12	default
82	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 13:56:23.067618	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	12	default
83	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:20.087619	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
84	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:20.603314	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
85	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:20.906994	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
86	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:21.193679	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
88	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:22.485345	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	14	default
89	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:23.068193	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	14	default
91	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:00:24.402617	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	14	default
92	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:01:57.843243	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
93	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:01:58.48897	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
94	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:01:58.781573	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
95	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:01:59.073385	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
97	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:02:00.44978	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	17	default
98	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:02:01.045819	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	17	default
100	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:02:02.40796	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	17	default
101	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:46.261046	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
102	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:46.766755	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
103	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:47.054495	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
104	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:47.337301	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
106	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:48.673379	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	20	default
107	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:49.260179	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	20	default
109	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:04:50.581475	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	20	default
110	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:27.258325	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
111	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:27.624295	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
112	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:27.907061	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
113	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:28.188927	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
115	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:29.374435	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	23	default
116	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:29.941631	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	23	default
118	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 14:06:31.265307	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	23	default
119	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:38:11.994723	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
120	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:53:20.362541	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	1	default
121	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:53:29.622593	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
122	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:54:21.903881	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
123	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:56:21.86905	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
124	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 16:56:52.783912	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
125	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:19:50.177473	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
126	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:19:52.283926	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	25	default
127	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:19:52.822185	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	25	default
128	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:20:44.602848	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
129	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:20:46.482949	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	26	default
131	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:20:47.926889	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	26	default
132	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:20:50.071912	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	26	default
133	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:00.159912	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
134	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:00.526008	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
135	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:00.827594	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
136	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:01.124381	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
138	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:02.387774	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	28	default
139	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:21:02.957887	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	28	default
141	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:18.326567	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
142	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:18.765565	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
143	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:19.069641	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
144	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:19.344174	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
146	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:20.766318	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	31	default
147	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:21.380484	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	31	default
149	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:22:22.760928	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	31	default
150	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:23:39.273097	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
151	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:16.070756	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
152	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:18.026891	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	34	default
154	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:19.508957	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	34	default
155	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:21.815163	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	34	default
156	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:31.584338	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
157	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:31.953998	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
158	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:32.226547	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
159	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:32.500449	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
161	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:33.729876	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	36	default
162	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:34.302363	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	36	default
164	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:24:35.610478	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	36	default
165	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:27:00.917959	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
166	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:30:19.497171	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	3	default
167	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:32:00.683195	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
169	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:44:27.494403	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
170	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 18:46:08.267572	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
171	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 19:03:46.91936	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
172	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 19:04:33.655041	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
173	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-29 19:04:57.45722	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
174	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 10:50:15.464943	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
175	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 10:51:47.999657	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
176	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:17:56.951247	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
177	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:18:39.340724	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
178	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:20:38.66391	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
179	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:21:17.002658	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
180	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:21:28.973855	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
181	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:21:43.274356	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
182	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:22:16.808808	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
183	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:22:29.807428	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
184	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:22:59.94509	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
185	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:01.824928	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	39	default
187	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:03.151288	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	39	default
188	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:05.241877	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	39	default
189	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:10.914831	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
190	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:11.251236	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
191	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:11.534348	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
192	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:11.816004	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
194	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:13.003542	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	41	default
195	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:13.600818	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	41	default
197	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:23:14.89916	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	41	default
198	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:26:17.525982	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
199	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 12:35:20.237866	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
200	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:20:19.843704	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
201	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:15.218453	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
202	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:20.779041	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
203	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:22.766531	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	43	default
205	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:24.12989	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	43	default
206	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:26.264352	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	43	default
207	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:31.834005	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
208	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:40.629435	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
209	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:40.964848	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
210	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:41.248723	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
211	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:41.539772	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
213	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:42.703385	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	45	default
214	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:43.282838	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	45	default
216	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 13:24:44.594285	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	45	default
217	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 15:17:03.491376	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
218	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:35.651503	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
219	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:44.797982	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
220	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:52.121191	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
221	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:52.473802	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
226	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:54.84091	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	48	default
231	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:29:37.412512	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
222	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:52.761685	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
223	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:53.052398	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
225	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:54.248487	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	48	default
228	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:15:56.177967	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	48	default
229	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:23:18.805567	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
230	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:29:27.365567	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
232	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:54:18.560916	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
233	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:22.398594	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
234	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:29.07218	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
235	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:30.963773	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	50	default
237	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:32.331011	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	50	default
238	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:34.446166	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	50	default
239	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:39.001048	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
240	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:46.421621	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
241	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:52.315885	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
242	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:52.656727	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
243	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:52.949507	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
244	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:53.237383	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
246	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:54.420983	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	52	default
247	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:55.018856	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	52	default
249	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 16:58:56.3517	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	52	default
250	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:31:14.735673	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
251	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:34:07.109431	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	1	default
252	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:36:54.723878	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
253	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:02.72549	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
254	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:09.205547	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
255	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:09.526201	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
256	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:09.811749	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
257	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:10.101768	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
259	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:11.298344	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	56	default
260	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:11.892204	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	56	default
262	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:13.221691	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	56	default
263	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 17:37:19.228371	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
264	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:22:01.023939	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	6	default
266	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:36:18.623845	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
267	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:43:25.923795	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
268	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:25.093531	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
269	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:33.839247	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
270	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:41.012817	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
271	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:51.464631	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
272	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:59.477699	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
273	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:46:59.811793	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2	default
274	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:47:00.091037	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	3	default
275	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:47:00.355303	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	4	default
277	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:47:01.545846	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	59	default
278	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:47:02.125057	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	59	default
280	\N	\N	0:0:0:0:0:0:0:1	\N	2026-10-30 18:47:03.454993	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	59	default
281	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 11:53:54.944237	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
282	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:08:09.593595	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
283	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:09.559551	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
284	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:17.540429	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
285	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:27.422349	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
286	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:34.575444	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
287	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:41.056535	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
288	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:10:50.425555	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
289	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:11:38.154444	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
290	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:11:40.083411	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	62	default
292	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:11:41.391318	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	62	default
293	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 12:11:43.487491	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	62	default
294	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 15:58:54.005596	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
295	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 16:00:28.183454	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
296	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 16:47:39.210734	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
297	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 16:55:36.575778	\N	\N	\N	SUCCESS	node	2	default
298	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 16:57:41.561405	\N	\N	\N	SUCCESS	node	2	default
299	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:02:58.850774	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
300	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:03:27.379468	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
301	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:11:36.008251	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
302	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:15:46.266908	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
303	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:22:13.72935	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
304	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:22:44.08342	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
305	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:23:01.339816	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
306	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:34:44.174083	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
307	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:41:04.75476	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
308	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 17:41:24.940879	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	1	default
309	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:16:23.067338	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
310	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:40:37.827677	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
311	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:40:44.384123	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
312	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:40:57.881555	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
313	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:49:44.485927	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
316	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-02 18:55:51.138863	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	1	default
317	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:08:00.599696	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
318	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:10:52.106476	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
319	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:12:49.957452	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
320	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:13:02.756262	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
321	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:13:13.376223	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
322	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:14:57.030698	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
323	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:15:06.230755	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
324	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:15:16.267353	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
325	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:15:25.320263	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	1	default
326	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:21:55.132691	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
327	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:23:13.117139	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
328	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:24:25.700406	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
329	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 12:27:30.809197	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
330	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:14:07.856264	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
331	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:19:02.369296	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	3	default
332	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:19:42.159373	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	1	default
333	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:20:23.439644	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
334	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:20:57.816295	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
335	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:21:20.622374	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
336	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:21:33.680612	\N	\N	\N	SUCCESS	node	1	default
337	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:21:53.330198	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
338	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:22:12.580195	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
339	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:22:39.228371	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
340	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:23:35.922992	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
341	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 13:26:31.11886	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
342	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 15:13:14.904999	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
343	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 15:22:41.806654	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	1	default
344	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 15:49:08.791555	\N	\N	\N	SUCCESS	node	1	default
345	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 16:00:01.794567	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
346	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 16:17:20.913377	\N	\N	\N	SUCCESS	node	1	default
347	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 16:45:07.108657	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
348	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 16:47:08.582749	\N	\N	\N	SUCCESS	node	1	default
349	\N	\N	0:0:0:0:0:0:0:1	\N	2026-11-03 16:57:30.209098	\N	\N	\N	SUCCESS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2	default
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, created_at, created_by, updated_at, updated_by, action_url, entity_id, entity_type, is_read, message, read_at, title, type, user_id, tenant_id) FROM stdin;
1	2026-10-28 17:49:26.081483	hr@hrms.com	2026-10-29 11:31:07.609231	emp@hrms.com	/leaves	\N	\N	t	Your CASUAL leave request for 2 days was approved.	2026-10-29 11:31:07.60524	Leave Request Approved	LEAVE_APPROVED	4	default
2	2026-10-29 13:05:06.861323	admin@hrms.com	2026-10-29 13:05:06.861323	admin@hrms.com	/requests	\N	\N	f	Your request 'Remote day for home fiber maintenance' was approved.	\N	WORK_FROM_HOME Request Approved	SYSTEM	4	default
3	2026-10-29 18:35:31.199616	hr@hrms.com	2026-10-29 18:35:31.199616	hr@hrms.com	/requests	\N	\N	f	Your request 'Remote Automated Testing' was approved.	\N	WORK_FROM_HOME Request Approved	SYSTEM	10	default
4	2026-10-29 18:35:33.979813	hr@hrms.com	2026-10-29 18:35:33.979813	hr@hrms.com	/requests	\N	\N	f	Your request 'Remote Automated Testing' was approved.	\N	WORK_FROM_HOME Request Approved	SYSTEM	12	default
6	2026-10-30 10:51:30.827014	hr@hrms.com	2026-10-30 12:26:32.480979	chelikamcharankumar@gmail.com	/leaves	\N	\N	t	Your SICK leave request for 1 days was approved.	2026-10-30 12:26:32.477015	Leave Request Approved	LEAVE_APPROVED	6	default
5	2026-10-30 10:51:09.221711	hr@hrms.com	2026-10-30 12:26:34.011537	chelikamcharankumar@gmail.com	/leaves	\N	\N	t	Your UNPAID leave request for 0 days was approved.	2026-10-30 12:26:34.011537	Leave Request Approved	LEAVE_APPROVED	6	default
7	2026-10-30 16:54:18.903738	admin@hrms.com	2026-10-30 16:54:18.903738	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'Production VPN Tunnel Timeout for DevOps' has been logged. SLA Target: 30-Oct 20:54	\N	Ticket Created: TKT-202610-9958	SYSTEM	49	default
8	2026-10-30 16:54:18.962441	admin@hrms.com	2026-10-30 16:54:18.962441	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'External Monitor Flickering & HDMI Port Failure' has been logged. SLA Target: 31-Oct 00:54	\N	Ticket Created: TKT-202610-2180	SYSTEM	49	default
9	2026-10-30 16:54:19.057797	admin@hrms.com	2026-10-30 16:54:19.057797	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now IN_PROGRESS.	\N	Ticket Update: TKT-202610-9958	SYSTEM	49	default
10	2026-10-30 16:54:19.110312	admin@hrms.com	2026-10-30 16:54:19.110312	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now RESOLVED.	\N	Ticket Update: TKT-202610-9958	SYSTEM	49	default
11	2026-10-30 16:58:22.517418	admin@hrms.com	2026-10-30 16:58:22.517418	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'Production VPN Tunnel Timeout for DevOps' has been logged. SLA Target: 30-Oct 20:58	\N	Ticket Created: TKT-202610-8375	SYSTEM	49	default
12	2026-10-30 16:58:22.548926	admin@hrms.com	2026-10-30 16:58:22.548926	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'External Monitor Flickering & HDMI Port Failure' has been logged. SLA Target: 31-Oct 00:58	\N	Ticket Created: TKT-202610-2082	SYSTEM	49	default
13	2026-10-30 16:58:22.60036	admin@hrms.com	2026-10-30 16:58:22.60036	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now IN_PROGRESS.	\N	Ticket Update: TKT-202610-8375	SYSTEM	49	default
14	2026-10-30 16:58:22.626713	admin@hrms.com	2026-10-30 16:58:22.626713	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now RESOLVED.	\N	Ticket Update: TKT-202610-8375	SYSTEM	49	default
15	2026-10-30 17:37:02.859704	admin@hrms.com	2026-10-30 17:37:02.859704	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'Production VPN Tunnel Timeout for DevOps' has been logged. SLA Target: 30-Oct 21:37	\N	Ticket Created: TKT-202610-5184	SYSTEM	54	default
16	2026-10-30 17:37:02.917817	admin@hrms.com	2026-10-30 17:37:02.917817	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'External Monitor Flickering & HDMI Port Failure' has been logged. SLA Target: 31-Oct 01:37	\N	Ticket Created: TKT-202610-2069	SYSTEM	54	default
17	2026-10-30 17:37:02.975973	admin@hrms.com	2026-10-30 17:37:02.975973	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now IN_PROGRESS.	\N	Ticket Update: TKT-202610-5184	SYSTEM	54	default
18	2026-10-30 17:37:03.003703	admin@hrms.com	2026-10-30 17:37:03.003703	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now RESOLVED.	\N	Ticket Update: TKT-202610-5184	SYSTEM	54	default
19	2026-10-30 18:46:33.955584	admin@hrms.com	2026-10-30 18:46:33.955584	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'Production VPN Tunnel Timeout for DevOps' has been logged. SLA Target: 30-Oct 22:46	\N	Ticket Created: TKT-202610-1712	SYSTEM	57	default
20	2026-10-30 18:46:34.015688	admin@hrms.com	2026-10-30 18:46:34.015688	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'External Monitor Flickering & HDMI Port Failure' has been logged. SLA Target: 31-Oct 02:46	\N	Ticket Created: TKT-202610-1184	SYSTEM	57	default
21	2026-10-30 18:46:34.0771	admin@hrms.com	2026-10-30 18:46:34.0771	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now IN_PROGRESS.	\N	Ticket Update: TKT-202610-1712	SYSTEM	57	default
22	2026-10-30 18:46:34.107785	admin@hrms.com	2026-10-30 18:46:34.107785	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now RESOLVED.	\N	Ticket Update: TKT-202610-1712	SYSTEM	57	default
23	2026-11-02 12:10:34.712458	admin@hrms.com	2026-11-02 12:10:34.712458	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'Production VPN Tunnel Timeout for DevOps' has been logged. SLA Target: 02-Nov 16:10	\N	Ticket Created: TKT-202611-4492	SYSTEM	60	default
24	2026-11-02 12:10:34.763559	admin@hrms.com	2026-11-02 12:10:34.763559	admin@hrms.com	/helpdesk	\N	\N	f	Your support ticket 'External Monitor Flickering & HDMI Port Failure' has been logged. SLA Target: 02-Nov 20:10	\N	Ticket Created: TKT-202611-5974	SYSTEM	60	default
25	2026-11-02 12:10:34.820469	admin@hrms.com	2026-11-02 12:10:34.820469	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now IN_PROGRESS.	\N	Ticket Update: TKT-202611-4492	SYSTEM	60	default
26	2026-11-02 12:10:34.844888	admin@hrms.com	2026-11-02 12:10:34.844888	admin@hrms.com	/helpdesk	\N	\N	f	Your ticket 'Production VPN Tunnel Timeout for DevOps' is now RESOLVED.	\N	Ticket Update: TKT-202611-4492	SYSTEM	60	default
\.


--
-- Data for Name: office_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.office_locations (id, tenant_id, name, address, latitude, longitude, radius_meters, ip_whitelist, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	Global Headquarters - Innovation Tower	Tech Boulevard, Block 4, Suite 800	12.9716000	77.5946000	250	192.168.1.0/24,10.0.0.0/16	t	2026-10-28 17:33:48.884617	2026-10-28 17:33:48.884617	\N	\N
2	default	eoxy's systems india pvt ltd	22, 7th Cross, KHB Main Road Kaval Bairasandra, Extn, RT Nagar, Bengaluru, Karnataka 560032	13.0272000	77.6063000	500	\N	t	2026-10-29 13:11:13.261332	2026-10-29 13:11:13.261332	hr@hrms.com	hr@hrms.com
\.


--
-- Data for Name: payroll_slips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_slips (id, created_at, created_by, updated_at, updated_by, basic_salary, gross_salary, hra, income_tax, leave_days, payroll_month, net_salary, other_allowances, other_deductions, paid_at, payment_reference, pf_deduction, present_days, processed_at, professional_tax, slip_url, special_allowance, status, total_deductions, working_days, payroll_year, employee_id, tenant_id, reimbursements, adjusted_at, adjusted_by, bonus, deductions_adjustment, hr_remarks, overtime_amount) FROM stdin;
1	2026-10-29 13:50:46.707198	hr@hrms.com	2026-10-29 13:50:46.707198	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 13:50:46.705191	0.00	\N	0.00	PROCESSED	0.00	22	2026	7	default	0.00	\N	\N	\N	\N	\N	\N
2	2026-10-29 13:56:23.633377	hr@hrms.com	2026-10-29 13:56:23.633377	hr@hrms.com	0.00	0.00	0.00	0.00	20	2	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 13:56:23.630369	0.00	\N	0.00	PROCESSED	0.00	20	2026	8	default	0.00	\N	\N	\N	\N	\N	\N
3	2026-10-29 14:00:25.169432	hr@hrms.com	2026-10-29 14:00:25.169432	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 14:00:25.165432	0.00	\N	0.00	PROCESSED	0.00	22	2026	9	default	0.00	\N	\N	\N	\N	\N	\N
4	2026-10-29 14:02:03.144769	hr@hrms.com	2026-10-29 14:02:03.144769	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 14:02:03.14077	0.00	\N	0.00	PROCESSED	0.00	22	2026	11	default	0.00	\N	\N	\N	\N	\N	\N
5	2026-10-29 14:04:51.231197	hr@hrms.com	2026-10-29 14:04:51.231197	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 14:04:51.227197	0.00	\N	0.00	PROCESSED	0.00	22	2026	13	default	0.00	\N	\N	\N	\N	\N	\N
6	2026-10-29 14:06:31.64394	hr@hrms.com	2026-10-29 14:06:31.64394	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 14:06:31.64394	0.00	\N	0.00	PROCESSED	0.00	22	2026	15	default	0.00	\N	\N	\N	\N	\N	\N
7	2026-10-29 18:21:04.547329	hr@hrms.com	2026-10-29 18:21:04.547329	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 18:21:04.543262	0.00	\N	0.00	PROCESSED	0.00	22	2026	19	default	0.00	\N	\N	\N	\N	\N	\N
8	2026-10-29 18:22:23.591091	hr@hrms.com	2026-10-29 18:22:23.591091	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 18:22:23.586826	0.00	\N	0.00	PROCESSED	0.00	22	2026	21	default	0.00	\N	\N	\N	\N	\N	\N
9	2026-10-29 18:24:36.247169	hr@hrms.com	2026-10-29 18:24:36.247169	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 18:24:36.243168	0.00	\N	0.00	PROCESSED	0.00	22	2026	25	default	0.00	\N	\N	\N	\N	\N	\N
10	2026-10-29 18:34:48.921931	hr@hrms.com	2026-10-29 18:34:48.921931	hr@hrms.com	0.00	0.00	0.00	0.00	23	10	0.00	\N	\N	\N	\N	0.00	0	2026-10-29 18:34:48.920896	0.00	\N	0.00	PROCESSED	0.00	23	2025	5	default	0.00	\N	\N	\N	\N	\N	\N
261	2026-10-30 17:37:13.781155	hr@hrms.com	2026-10-30 17:37:13.781155	hr@hrms.com	47499.98	94999.96	18999.99	4750.00	0	1	84349.96	\N	\N	\N	\N	5700.00	22	2026-10-30 17:37:13.781155	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	40	default	0.00	\N	\N	\N	\N	\N	\N
336	2026-11-02 12:10:41.523377	admin@hrms.com	2026-11-02 12:10:41.523377	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.523377	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	41	default	0.00	\N	\N	\N	\N	\N	\N
337	2026-11-02 12:10:41.531758	admin@hrms.com	2026-11-02 12:10:41.531758	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.531758	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	42	default	0.00	\N	\N	\N	\N	\N	\N
338	2026-11-02 12:10:41.53984	admin@hrms.com	2026-11-02 12:10:41.53984	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.53984	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	43	default	0.00	\N	\N	\N	\N	\N	\N
340	2026-11-03 12:08:00.841827	admin@hrms.com	2026-11-03 12:14:57.107458	admin@hrms.com	47500.01	107500.01	19000.00	4750.00	0	11	96350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.83616	200.00	\N	28500.00	APPROVED	11150.00	21	2026	6	default	0.00	2026-11-03 12:13:02.81086	admin@hrms.com	10000.00	500.00	Approved festive incentive + 10hrs overtime	2500.00
366	2026-11-03 12:08:01.186627	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.186627	200.00	\N	22500.00	APPROVED	8450.00	21	2026	30	default	0.00	\N	\N	0.00	0.00	\N	0.00
367	2026-11-03 12:08:01.198981	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.198981	200.00	\N	28500.00	APPROVED	10650.00	21	2026	32	default	0.00	\N	\N	0.00	0.00	\N	0.00
368	2026-11-03 12:08:01.21145	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.210458	200.00	\N	22500.00	APPROVED	8450.00	21	2026	33	default	0.00	\N	\N	0.00	0.00	\N	0.00
369	2026-11-03 12:08:01.221274	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.221274	200.00	\N	28500.00	APPROVED	10650.00	21	2026	34	default	0.00	\N	\N	0.00	0.00	\N	0.00
370	2026-11-03 12:08:01.233492	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.233492	200.00	\N	22500.00	APPROVED	8450.00	21	2026	35	default	0.00	\N	\N	0.00	0.00	\N	0.00
371	2026-11-03 12:08:01.245871	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.245871	200.00	\N	36000.02	APPROVED	13400.01	21	2026	36	default	0.00	\N	\N	0.00	0.00	\N	0.00
372	2026-11-03 12:08:01.256337	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.256337	200.00	\N	28500.00	APPROVED	10650.00	21	2026	37	default	0.00	\N	\N	0.00	0.00	\N	0.00
373	2026-11-03 12:08:01.267912	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.267912	200.00	\N	22500.00	APPROVED	8450.00	21	2026	38	default	0.00	\N	\N	0.00	0.00	\N	0.00
374	2026-11-03 12:08:01.279187	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	900000.05	1800000.09	360000.02	90000.00	0	11	1601800.08	\N	\N	\N	\N	108000.01	21	2026-11-03 12:08:01.279187	200.00	\N	540000.02	APPROVED	198200.01	21	2026	39	default	0.00	\N	\N	0.00	0.00	\N	0.00
375	2026-11-03 12:08:01.288808	admin@hrms.com	2026-11-03 12:15:16.360344	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.288808	200.00	\N	28500.00	APPROVED	10650.00	21	2026	40	default	0.00	\N	\N	0.00	0.00	\N	0.00
376	2026-11-03 12:08:01.298908	admin@hrms.com	2026-11-03 12:15:16.362336	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.298908	200.00	\N	22500.00	APPROVED	8450.00	21	2026	41	default	0.00	\N	\N	0.00	0.00	\N	0.00
377	2026-11-03 12:08:01.309044	admin@hrms.com	2026-11-03 12:15:16.363336	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.307758	200.00	\N	28500.00	APPROVED	10650.00	21	2026	42	default	0.00	\N	\N	0.00	0.00	\N	0.00
378	2026-11-03 12:08:01.353458	admin@hrms.com	2026-11-03 12:15:16.363336	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.352107	200.00	\N	22500.00	APPROVED	8450.00	21	2026	43	default	0.00	\N	\N	0.00	0.00	\N	0.00
379	2026-11-03 12:08:01.366741	admin@hrms.com	2026-11-03 12:15:16.363336	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.366741	200.00	\N	36000.02	APPROVED	13400.01	21	2026	44	default	0.00	\N	\N	0.00	0.00	\N	0.00
380	2026-11-03 12:08:01.3878	admin@hrms.com	2026-11-03 12:15:16.366354	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.386801	200.00	\N	36000.02	APPROVED	13400.01	21	2026	45	default	0.00	\N	\N	0.00	0.00	\N	0.00
131	2026-10-30 13:24:45.136334	hr@hrms.com	2026-10-30 13:24:45.136334	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-30 13:24:45.136334	0.00	\N	0.00	PROCESSED	0.00	22	2026	32	default	0.00	\N	\N	\N	\N	\N	\N
77	2026-10-30 12:23:15.404695	hr@hrms.com	2026-10-30 12:23:15.404695	hr@hrms.com	0.00	0.00	0.00	0.00	22	1	0.00	\N	\N	\N	\N	0.00	0	2026-10-30 12:23:15.403687	0.00	\N	0.00	PROCESSED	0.00	22	2026	29	default	0.00	\N	\N	\N	\N	\N	\N
341	2026-11-03 12:08:00.872517	admin@hrms.com	2026-11-03 12:15:16.355333	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.872517	200.00	\N	28500.00	APPROVED	10650.00	21	2026	7	default	0.00	\N	\N	0.00	0.00	\N	0.00
225	2026-10-30 16:58:56.890948	hr@hrms.com	2026-10-30 16:58:56.890948	hr@hrms.com	47499.98	94999.96	18999.99	4750.00	0	1	84349.96	\N	\N	\N	\N	5700.00	22	2026-10-30 16:58:56.890948	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	37	default	0.00	\N	\N	\N	\N	\N	\N
161	2026-10-30 16:15:56.795274	hr@hrms.com	2026-10-30 16:15:56.795274	hr@hrms.com	47499.98	94999.96	18999.99	4750.00	0	1	84349.96	\N	\N	\N	\N	5700.00	22	2026-10-30 16:15:56.795274	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	34	default	0.00	\N	\N	\N	\N	\N	\N
342	2026-11-03 12:08:00.887158	admin@hrms.com	2026-11-03 12:15:16.355333	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.887158	200.00	\N	28500.00	APPROVED	10650.00	21	2026	8	default	0.00	\N	\N	0.00	0.00	\N	0.00
343	2026-11-03 12:08:00.902989	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.902989	200.00	\N	28500.00	APPROVED	10650.00	21	2026	9	default	0.00	\N	\N	0.00	0.00	\N	0.00
344	2026-11-03 12:08:00.917155	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:00.917155	200.00	\N	22500.00	APPROVED	8450.00	21	2026	10	default	0.00	\N	\N	0.00	0.00	\N	0.00
345	2026-11-03 12:08:00.933383	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.933383	200.00	\N	28500.00	APPROVED	10650.00	21	2026	11	default	0.00	\N	\N	0.00	0.00	\N	0.00
346	2026-11-03 12:08:00.946165	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:00.946165	200.00	\N	22500.00	APPROVED	8450.00	21	2026	12	default	0.00	\N	\N	0.00	0.00	\N	0.00
347	2026-11-03 12:08:00.959046	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.958541	200.00	\N	28500.00	APPROVED	10650.00	21	2026	13	default	0.00	\N	\N	0.00	0.00	\N	0.00
348	2026-11-03 12:08:00.973814	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:00.973814	200.00	\N	22500.00	APPROVED	8450.00	21	2026	14	default	0.00	\N	\N	0.00	0.00	\N	0.00
349	2026-11-03 12:08:00.98644	admin@hrms.com	2026-11-03 12:15:16.356331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:00.98644	200.00	\N	28500.00	APPROVED	10650.00	21	2026	15	default	0.00	\N	\N	0.00	0.00	\N	0.00
350	2026-11-03 12:08:00.99891	admin@hrms.com	2026-11-03 12:15:16.357333	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:00.99891	200.00	\N	22500.00	APPROVED	8450.00	21	2026	16	default	0.00	\N	\N	0.00	0.00	\N	0.00
351	2026-11-03 12:08:01.011401	admin@hrms.com	2026-11-03 12:15:16.357333	admin@hrms.com	32500.02	65000.04	13000.01	3250.00	0	11	57650.04	\N	\N	\N	\N	3900.00	21	2026-11-03 12:08:01.011401	200.00	\N	19500.01	APPROVED	7350.00	21	2026	5	default	0.00	\N	\N	0.00	0.00	\N	0.00
352	2026-11-03 12:08:01.023634	admin@hrms.com	2026-11-03 12:15:16.357333	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.023634	200.00	\N	36000.02	APPROVED	13400.01	21	2026	17	default	0.00	\N	\N	0.00	0.00	\N	0.00
353	2026-11-03 12:08:01.035373	admin@hrms.com	2026-11-03 12:15:16.357333	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.035373	200.00	\N	36000.02	APPROVED	13400.01	21	2026	18	default	0.00	\N	\N	0.00	0.00	\N	0.00
354	2026-11-03 12:08:01.046644	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.045642	200.00	\N	28500.00	APPROVED	10650.00	21	2026	19	default	0.00	\N	\N	0.00	0.00	\N	0.00
355	2026-11-03 12:08:01.057471	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.057471	200.00	\N	22500.00	APPROVED	8450.00	21	2026	20	default	0.00	\N	\N	0.00	0.00	\N	0.00
356	2026-11-03 12:08:01.07027	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.069745	200.00	\N	28500.00	APPROVED	10650.00	21	2026	21	default	0.00	\N	\N	0.00	0.00	\N	0.00
357	2026-11-03 12:08:01.082688	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.082688	200.00	\N	22500.00	APPROVED	8450.00	21	2026	22	default	0.00	\N	\N	0.00	0.00	\N	0.00
358	2026-11-03 12:08:01.097073	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.096549	200.00	\N	36000.02	APPROVED	13400.01	21	2026	23	default	0.00	\N	\N	0.00	0.00	\N	0.00
359	2026-11-03 12:08:01.10903	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.108029	200.00	\N	36000.02	APPROVED	13400.01	21	2026	24	default	0.00	\N	\N	0.00	0.00	\N	0.00
360	2026-11-03 12:08:01.120725	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.120201	200.00	\N	28500.00	APPROVED	10650.00	21	2026	25	default	0.00	\N	\N	0.00	0.00	\N	0.00
361	2026-11-03 12:08:01.13237	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	37500.02	75000.03	15000.01	3750.00	0	11	66550.03	\N	\N	\N	\N	4500.00	21	2026-11-03 12:08:01.13137	200.00	\N	22500.00	APPROVED	8450.00	21	2026	26	default	0.00	\N	\N	0.00	0.00	\N	0.00
362	2026-11-03 12:08:01.143519	admin@hrms.com	2026-11-03 12:15:16.35833	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.143519	200.00	\N	36000.02	APPROVED	13400.01	21	2026	27	default	0.00	\N	\N	0.00	0.00	\N	0.00
363	2026-11-03 12:08:01.153394	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.153394	200.00	\N	36000.02	APPROVED	13400.01	21	2026	28	default	0.00	\N	\N	0.00	0.00	\N	0.00
364	2026-11-03 12:08:01.165386	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	47500.01	95000.01	19000.00	4750.00	0	11	84350.01	\N	\N	\N	\N	5700.00	21	2026-11-03 12:08:01.165386	200.00	\N	28500.00	APPROVED	10650.00	21	2026	29	default	0.00	\N	\N	0.00	0.00	\N	0.00
365	2026-11-03 12:08:01.176316	admin@hrms.com	2026-11-03 12:15:16.359331	admin@hrms.com	60000.05	120000.09	24000.02	6000.00	0	11	106600.08	\N	\N	\N	\N	7200.01	21	2026-11-03 12:08:01.176316	200.00	\N	36000.02	APPROVED	13400.01	21	2026	31	default	0.00	\N	\N	0.00	0.00	\N	0.00
299	2026-10-30 18:47:03.957436	hr@hrms.com	2026-10-30 18:47:03.957436	hr@hrms.com	47499.98	94999.96	18999.99	4750.00	0	1	84349.96	\N	\N	\N	\N	5700.00	22	2026-10-30 18:47:03.957436	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	42	default	0.00	\N	\N	\N	\N	\N	\N
300	2026-11-02 12:10:41.189897	admin@hrms.com	2026-11-02 12:10:41.189897	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.187384	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	6	default	0.00	\N	\N	\N	\N	\N	\N
301	2026-11-02 12:10:41.209683	admin@hrms.com	2026-11-02 12:10:41.209683	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.209041	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	7	default	0.00	\N	\N	\N	\N	\N	\N
302	2026-11-02 12:10:41.220046	admin@hrms.com	2026-11-02 12:10:41.220046	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.220046	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	8	default	0.00	\N	\N	\N	\N	\N	\N
303	2026-11-02 12:10:41.230232	admin@hrms.com	2026-11-02 12:10:41.230232	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.230232	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	9	default	0.00	\N	\N	\N	\N	\N	\N
304	2026-11-02 12:10:41.24002	admin@hrms.com	2026-11-02 12:10:41.24002	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.24002	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	10	default	0.00	\N	\N	\N	\N	\N	\N
305	2026-11-02 12:10:41.249859	admin@hrms.com	2026-11-02 12:10:41.249859	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.249859	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	11	default	0.00	\N	\N	\N	\N	\N	\N
306	2026-11-02 12:10:41.2593	admin@hrms.com	2026-11-02 12:10:41.2593	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.2593	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	12	default	0.00	\N	\N	\N	\N	\N	\N
307	2026-11-02 12:10:41.268245	admin@hrms.com	2026-11-02 12:10:41.268245	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.268245	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	13	default	0.00	\N	\N	\N	\N	\N	\N
308	2026-11-02 12:10:41.277337	admin@hrms.com	2026-11-02 12:10:41.277337	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.277337	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	14	default	0.00	\N	\N	\N	\N	\N	\N
309	2026-11-02 12:10:41.288707	admin@hrms.com	2026-11-02 12:10:41.288707	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.288707	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	15	default	0.00	\N	\N	\N	\N	\N	\N
310	2026-11-02 12:10:41.298176	admin@hrms.com	2026-11-02 12:10:41.298176	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.298176	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	16	default	0.00	\N	\N	\N	\N	\N	\N
311	2026-11-02 12:10:41.308233	admin@hrms.com	2026-11-02 12:10:41.308233	admin@hrms.com	32500.05	65000.10	13000.02	3250.01	0	10	57650.08	\N	\N	\N	\N	3900.01	22	2026-11-02 12:10:41.308233	200.00	\N	19500.03	PROCESSED	7350.02	22	2026	5	default	0.00	\N	\N	\N	\N	\N	\N
312	2026-11-02 12:10:41.317956	admin@hrms.com	2026-11-02 12:10:41.317956	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.317403	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	17	default	0.00	\N	\N	\N	\N	\N	\N
313	2026-11-02 12:10:41.326846	admin@hrms.com	2026-11-02 12:10:41.326846	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.326288	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	18	default	0.00	\N	\N	\N	\N	\N	\N
314	2026-11-02 12:10:41.335181	admin@hrms.com	2026-11-02 12:10:41.335181	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.334664	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	19	default	0.00	\N	\N	\N	\N	\N	\N
315	2026-11-02 12:10:41.343455	admin@hrms.com	2026-11-02 12:10:41.343455	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.342927	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	20	default	0.00	\N	\N	\N	\N	\N	\N
316	2026-11-02 12:10:41.351837	admin@hrms.com	2026-11-02 12:10:41.351837	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.351311	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	21	default	0.00	\N	\N	\N	\N	\N	\N
317	2026-11-02 12:10:41.35965	admin@hrms.com	2026-11-02 12:10:41.35965	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.35965	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	22	default	0.00	\N	\N	\N	\N	\N	\N
318	2026-11-02 12:10:41.369191	admin@hrms.com	2026-11-02 12:10:41.369191	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.368657	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	23	default	0.00	\N	\N	\N	\N	\N	\N
319	2026-11-02 12:10:41.377991	admin@hrms.com	2026-11-02 12:10:41.377991	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.377459	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	24	default	0.00	\N	\N	\N	\N	\N	\N
320	2026-11-02 12:10:41.386284	admin@hrms.com	2026-11-02 12:10:41.386284	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.386284	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	25	default	0.00	\N	\N	\N	\N	\N	\N
321	2026-11-02 12:10:41.395757	admin@hrms.com	2026-11-02 12:10:41.395757	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.395215	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	26	default	0.00	\N	\N	\N	\N	\N	\N
322	2026-11-02 12:10:41.403664	admin@hrms.com	2026-11-02 12:10:41.403664	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.403664	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	27	default	0.00	\N	\N	\N	\N	\N	\N
323	2026-11-02 12:10:41.411901	admin@hrms.com	2026-11-02 12:10:41.411901	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.411901	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	28	default	0.00	\N	\N	\N	\N	\N	\N
324	2026-11-02 12:10:41.421056	admin@hrms.com	2026-11-02 12:10:41.421056	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.421056	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	29	default	0.00	\N	\N	\N	\N	\N	\N
325	2026-11-02 12:10:41.42986	admin@hrms.com	2026-11-02 12:10:41.42986	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.429339	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	31	default	0.00	\N	\N	\N	\N	\N	\N
326	2026-11-02 12:10:41.438363	admin@hrms.com	2026-11-02 12:10:41.438363	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.43785	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	30	default	0.00	\N	\N	\N	\N	\N	\N
327	2026-11-02 12:10:41.44706	admin@hrms.com	2026-11-02 12:10:41.44706	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.44706	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	32	default	0.00	\N	\N	\N	\N	\N	\N
328	2026-11-02 12:10:41.45546	admin@hrms.com	2026-11-02 12:10:41.45546	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.45546	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	33	default	0.00	\N	\N	\N	\N	\N	\N
329	2026-11-02 12:10:41.464325	admin@hrms.com	2026-11-02 12:10:41.464325	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.463803	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	34	default	0.00	\N	\N	\N	\N	\N	\N
330	2026-11-02 12:10:41.472206	admin@hrms.com	2026-11-02 12:10:41.472206	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.472206	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	35	default	0.00	\N	\N	\N	\N	\N	\N
331	2026-11-02 12:10:41.481159	admin@hrms.com	2026-11-02 12:10:41.481159	admin@hrms.com	60000.05	120000.10	24000.02	6000.01	0	10	106600.08	\N	\N	\N	\N	7200.01	22	2026-11-02 12:10:41.481159	200.00	\N	36000.03	PROCESSED	13400.02	22	2026	36	default	0.00	\N	\N	\N	\N	\N	\N
332	2026-11-02 12:10:41.490387	admin@hrms.com	2026-11-02 12:10:41.490387	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.490387	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	37	default	0.00	\N	\N	\N	\N	\N	\N
333	2026-11-02 12:10:41.498826	admin@hrms.com	2026-11-02 12:10:41.498826	admin@hrms.com	37499.99	74999.98	15000.00	3750.00	0	10	66549.98	\N	\N	\N	\N	4500.00	22	2026-11-02 12:10:41.498307	200.00	\N	22499.99	PROCESSED	8450.00	22	2026	38	default	0.00	\N	\N	\N	\N	\N	\N
334	2026-11-02 12:10:41.505496	admin@hrms.com	2026-11-02 12:10:41.505496	admin@hrms.com	899999.98	1799999.96	359999.99	90000.00	0	10	1601799.96	\N	\N	\N	\N	108000.00	22	2026-11-02 12:10:41.505496	200.00	\N	539999.99	PROCESSED	198200.00	22	2026	39	default	0.00	\N	\N	\N	\N	\N	\N
335	2026-11-02 12:10:41.514305	admin@hrms.com	2026-11-02 12:10:41.514305	admin@hrms.com	47499.98	94999.96	18999.99	4750.00	0	10	84349.96	\N	\N	\N	\N	5700.00	22	2026-11-02 12:10:41.514305	200.00	\N	28499.99	PROCESSED	10650.00	22	2026	40	default	0.00	\N	\N	\N	\N	\N	\N
423	2026-11-03 12:24:31.475981	admin@hrms.com	2026-11-03 12:24:43.056486	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.475467	200.00	\N	28499.96	APPROVED	10649.98	23	2026	7	default	0.00	\N	\N	0.00	0.00	\N	0.00
422	2026-11-03 12:24:31.461445	admin@hrms.com	2026-11-03 12:24:39.919004	admin@hrms.com	47499.95	113999.89	18999.98	4749.99	0	12	101349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.460441	200.00	\N	28499.96	APPROVED	12649.98	23	2026	6	default	0.00	2026-11-03 12:24:37.859452	admin@hrms.com	15000.00	2000.00	Director approved Q4 festival bonus, weekend shift overtime, and monthly advance recovery.	4000.00
424	2026-11-03 12:24:31.488342	admin@hrms.com	2026-11-03 12:24:43.057435	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.487334	200.00	\N	28499.96	APPROVED	10649.98	23	2026	8	default	0.00	\N	\N	0.00	0.00	\N	0.00
425	2026-11-03 12:24:31.497658	admin@hrms.com	2026-11-03 12:24:43.057435	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.497658	200.00	\N	28499.96	APPROVED	10649.98	23	2026	9	default	0.00	\N	\N	0.00	0.00	\N	0.00
426	2026-11-03 12:24:31.507965	admin@hrms.com	2026-11-03 12:24:43.057435	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.507965	200.00	\N	22500.00	APPROVED	8450.00	23	2026	10	default	0.00	\N	\N	0.00	0.00	\N	0.00
427	2026-11-03 12:24:31.522003	admin@hrms.com	2026-11-03 12:24:43.057435	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.522003	200.00	\N	28499.96	APPROVED	10649.98	23	2026	11	default	0.00	\N	\N	0.00	0.00	\N	0.00
428	2026-11-03 12:24:31.545517	admin@hrms.com	2026-11-03 12:24:43.057435	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.544528	200.00	\N	22500.00	APPROVED	8450.00	23	2026	12	default	0.00	\N	\N	0.00	0.00	\N	0.00
429	2026-11-03 12:24:31.557461	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.557461	200.00	\N	28499.96	APPROVED	10649.98	23	2026	13	default	0.00	\N	\N	0.00	0.00	\N	0.00
430	2026-11-03 12:24:31.574111	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.574111	200.00	\N	22500.00	APPROVED	8450.00	23	2026	14	default	0.00	\N	\N	0.00	0.00	\N	0.00
431	2026-11-03 12:24:31.585786	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.585279	200.00	\N	28499.96	APPROVED	10649.98	23	2026	15	default	0.00	\N	\N	0.00	0.00	\N	0.00
432	2026-11-03 12:24:31.59453	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.593999	200.00	\N	22500.00	APPROVED	8450.00	23	2026	16	default	0.00	\N	\N	0.00	0.00	\N	0.00
433	2026-11-03 12:24:31.604762	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	32500.04	65000.07	13000.01	3250.00	0	12	57650.07	\N	\N	\N	\N	3900.00	23	2026-11-03 12:24:31.60423	200.00	\N	19500.02	APPROVED	7350.00	23	2026	5	default	0.00	\N	\N	0.00	0.00	\N	0.00
434	2026-11-03 12:24:31.611957	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.611957	200.00	\N	35999.99	APPROVED	13400.00	23	2026	17	default	0.00	\N	\N	0.00	0.00	\N	0.00
435	2026-11-03 12:24:31.621854	admin@hrms.com	2026-11-03 12:24:43.057942	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.621346	200.00	\N	35999.99	APPROVED	13400.00	23	2026	18	default	0.00	\N	\N	0.00	0.00	\N	0.00
436	2026-11-03 12:24:31.629945	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.629945	200.00	\N	28499.96	APPROVED	10649.98	23	2026	19	default	0.00	\N	\N	0.00	0.00	\N	0.00
437	2026-11-03 12:24:31.639333	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.638795	200.00	\N	22500.00	APPROVED	8450.00	23	2026	20	default	0.00	\N	\N	0.00	0.00	\N	0.00
438	2026-11-03 12:24:31.647234	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.646234	200.00	\N	28499.96	APPROVED	10649.98	23	2026	21	default	0.00	\N	\N	0.00	0.00	\N	0.00
439	2026-11-03 12:24:31.654702	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.654702	200.00	\N	22500.00	APPROVED	8450.00	23	2026	22	default	0.00	\N	\N	0.00	0.00	\N	0.00
440	2026-11-03 12:24:31.662658	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.662133	200.00	\N	35999.99	APPROVED	13400.00	23	2026	23	default	0.00	\N	\N	0.00	0.00	\N	0.00
441	2026-11-03 12:24:31.670784	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.670784	200.00	\N	35999.99	APPROVED	13400.00	23	2026	24	default	0.00	\N	\N	0.00	0.00	\N	0.00
442	2026-11-03 12:24:31.679221	admin@hrms.com	2026-11-03 12:24:43.058619	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.678225	200.00	\N	28499.96	APPROVED	10649.98	23	2026	25	default	0.00	\N	\N	0.00	0.00	\N	0.00
443	2026-11-03 12:24:31.687104	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.687104	200.00	\N	22500.00	APPROVED	8450.00	23	2026	26	default	0.00	\N	\N	0.00	0.00	\N	0.00
444	2026-11-03 12:24:31.696194	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.696194	200.00	\N	35999.99	APPROVED	13400.00	23	2026	27	default	0.00	\N	\N	0.00	0.00	\N	0.00
445	2026-11-03 12:24:31.705834	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.705834	200.00	\N	35999.99	APPROVED	13400.00	23	2026	28	default	0.00	\N	\N	0.00	0.00	\N	0.00
446	2026-11-03 12:24:31.714809	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.7143	200.00	\N	28499.96	APPROVED	10649.98	23	2026	29	default	0.00	\N	\N	0.00	0.00	\N	0.00
447	2026-11-03 12:24:31.722384	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.722384	200.00	\N	35999.99	APPROVED	13400.00	23	2026	31	default	0.00	\N	\N	0.00	0.00	\N	0.00
448	2026-11-03 12:24:31.731167	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.730569	200.00	\N	22500.00	APPROVED	8450.00	23	2026	30	default	0.00	\N	\N	0.00	0.00	\N	0.00
457	2026-11-03 12:24:31.807939	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.807375	200.00	\N	28499.96	APPROVED	10649.98	23	2026	40	default	0.00	\N	\N	0.00	0.00	\N	0.00
458	2026-11-03 12:24:31.81537	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.814835	200.00	\N	22500.00	APPROVED	8450.00	23	2026	41	default	0.00	\N	\N	0.00	0.00	\N	0.00
449	2026-11-03 12:24:31.739985	admin@hrms.com	2026-11-03 12:24:43.059194	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.739423	200.00	\N	28499.96	APPROVED	10649.98	23	2026	32	default	0.00	\N	\N	0.00	0.00	\N	0.00
450	2026-11-03 12:24:31.747333	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.747333	200.00	\N	22500.00	APPROVED	8450.00	23	2026	33	default	0.00	\N	\N	0.00	0.00	\N	0.00
451	2026-11-03 12:24:31.757037	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.757037	200.00	\N	28499.96	APPROVED	10649.98	23	2026	34	default	0.00	\N	\N	0.00	0.00	\N	0.00
452	2026-11-03 12:24:31.765292	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.764781	200.00	\N	22500.00	APPROVED	8450.00	23	2026	35	default	0.00	\N	\N	0.00	0.00	\N	0.00
453	2026-11-03 12:24:31.774335	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.774335	200.00	\N	35999.99	APPROVED	13400.00	23	2026	36	default	0.00	\N	\N	0.00	0.00	\N	0.00
454	2026-11-03 12:24:31.782937	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.782937	200.00	\N	28499.96	APPROVED	10649.98	23	2026	37	default	0.00	\N	\N	0.00	0.00	\N	0.00
455	2026-11-03 12:24:31.792076	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.79154	200.00	\N	22500.00	APPROVED	8450.00	23	2026	38	default	0.00	\N	\N	0.00	0.00	\N	0.00
456	2026-11-03 12:24:31.799849	admin@hrms.com	2026-11-03 12:24:43.059717	admin@hrms.com	900000.01	1800000.01	360000.00	90000.00	0	12	1601800.01	\N	\N	\N	\N	108000.00	23	2026-11-03 12:24:31.799849	200.00	\N	540000.00	APPROVED	198200.00	23	2026	39	default	0.00	\N	\N	0.00	0.00	\N	0.00
459	2026-11-03 12:24:31.822225	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	47499.95	94999.89	18999.98	4749.99	0	12	84349.91	\N	\N	\N	\N	5699.99	23	2026-11-03 12:24:31.822225	200.00	\N	28499.96	APPROVED	10649.98	23	2026	42	default	0.00	\N	\N	0.00	0.00	\N	0.00
460	2026-11-03 12:24:31.830658	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	37500.01	75000.01	15000.00	3750.00	0	12	66550.01	\N	\N	\N	\N	4500.00	23	2026-11-03 12:24:31.830098	200.00	\N	22500.00	APPROVED	8450.00	23	2026	43	default	0.00	\N	\N	0.00	0.00	\N	0.00
461	2026-11-03 12:24:31.838316	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.838316	200.00	\N	35999.99	APPROVED	13400.00	23	2026	44	default	0.00	\N	\N	0.00	0.00	\N	0.00
462	2026-11-03 12:24:31.845736	admin@hrms.com	2026-11-03 12:24:43.060254	admin@hrms.com	59999.99	119999.97	23999.99	6000.00	0	12	106599.97	\N	\N	\N	\N	7200.00	23	2026-11-03 12:24:31.845736	200.00	\N	35999.99	APPROVED	13400.00	23	2026	45	default	0.00	\N	\N	0.00	0.00	\N	0.00
\.


--
-- Data for Name: performance_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.performance_reviews (id, created_at, created_by, updated_at, updated_by, areas_of_improvement, final_rating, goals_next_cycle, manager_comments, manager_rating, review_cycle, review_period_end, review_period_start, self_comments, self_rating, status, strengths, employee_id, reviewer_id, tenant_id) FROM stdin;
2	2026-10-29 11:54:47.439656	\N	\N	\N	Can delegate more tasks to streamline bandwidth.	4.5	\N	\N	5	FY 2026-2027	2027-03-31	2026-04-01	\N	4	COMPLETED	Exceptional architectural foresight and ownership of high-impact platforms.	1	1	default
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, category, description, created_at) FROM stdin;
1	USER_READ	USER	View users list and profile information	2026-10-28 16:12:22.287849
2	USER_WRITE	USER	Create and modify user accounts	2026-10-28 16:12:22.287849
3	USER_DELETE	USER	Deactivate or delete user accounts	2026-10-28 16:12:22.287849
4	EMPLOYEE_READ	EMPLOYEE	View employee records	2026-10-28 16:12:22.287849
5	EMPLOYEE_WRITE	EMPLOYEE	Add or update employee information	2026-10-28 16:12:22.287849
6	EMPLOYEE_DELETE	EMPLOYEE	Archive or delete employee records	2026-10-28 16:12:22.287849
7	DEPARTMENT_READ	DEPARTMENT	View departments and organization structure	2026-10-28 16:12:22.287849
8	DEPARTMENT_WRITE	DEPARTMENT	Manage departments and budgets	2026-10-28 16:12:22.287849
9	ATTENDANCE_READ	ATTENDANCE	View attendance logs and timesheets	2026-10-28 16:12:22.287849
10	ATTENDANCE_WRITE	ATTENDANCE	Mark and modify attendance records	2026-10-28 16:12:22.287849
11	LEAVE_READ	LEAVE	View leave balances and requests	2026-10-28 16:12:22.287849
12	LEAVE_APPLY	LEAVE	Submit leave applications	2026-10-28 16:12:22.287849
13	LEAVE_APPROVE	LEAVE	Approve or reject leave applications	2026-10-28 16:12:22.287849
14	PAYROLL_READ	PAYROLL	View payroll slips and history	2026-10-28 16:12:22.287849
15	PAYROLL_PROCESS	PAYROLL	Run and approve payroll calculations	2026-10-28 16:12:22.287849
16	RECRUITMENT_MANAGE	RECRUITMENT	Manage job postings and applicants	2026-10-28 16:12:22.287849
17	PERFORMANCE_MANAGE	PERFORMANCE	Conduct performance reviews and appraisals	2026-10-28 16:12:22.287849
18	AUDIT_VIEW	AUDIT	View system audit trails and security logs	2026-10-28 16:12:22.287849
19	SETTINGS_MANAGE	SETTINGS	Configure tenant and platform settings	2026-10-28 16:12:22.287849
20	SYSTEM_ADMIN	SYSTEM	Full system administration access	2026-10-28 16:12:22.287849
\.


--
-- Data for Name: policy_acknowledgements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.policy_acknowledgements (id, tenant_id, document_id, employee_id, acknowledged_at, ip_address, created_at, created_by, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, device_info, expiry_date, ip_address, is_revoked, revoked_at, token, user_id, tenant_id) FROM stdin;
1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 13:01:35.052461+05:30	0:0:0:0:0:0:0:1	f	\N	0a5129f0-917e-46f3-b481-783e28339a30	1	default
2	\N	2026-11-04 15:28:53.969535+05:30	\N	t	2026-10-28 15:29:37.082618+05:30	dbce58ca-5644-4190-8ca8-a0fe5e55e60b	5	default
3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 15:29:39.890516+05:30	0:0:0:0:0:0:0:1	t	2026-10-28 15:30:15.058018+05:30	eeadaa3f-0f4f-4da6-aca1-4568a59a35ec	5	default
4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 15:33:12.673725+05:30	0:0:0:0:0:0:0:1	t	2026-10-28 15:33:39.569458+05:30	ec2e62f6-b2bb-429e-89c5-5a5269fb8fbf	5	default
5	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:55:04.553211+05:30	0:0:0:0:0:0:0:1	f	\N	49d2eaf1-e247-4e87-aff5-126df906f560	1	default
6	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:55:09.942126+05:30	0:0:0:0:0:0:0:1	f	\N	64ed92dc-b82b-4268-89d2-3fb84d288660	2	default
7	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:55:40.269727+05:30	0:0:0:0:0:0:0:1	f	\N	1f866d94-cd5a-4e28-a358-89004b6ff5e2	1	default
8	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:55:47.055501+05:30	0:0:0:0:0:0:0:1	f	\N	0ccd5dea-4b09-4d04-bbe4-79839a600c86	1	default
9	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:57:12.100346+05:30	0:0:0:0:0:0:0:1	f	\N	a314b68d-56c4-401b-8f1b-ba43a0085b3f	1	default
10	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:57:18.810728+05:30	0:0:0:0:0:0:0:1	f	\N	924895af-9a5f-4dad-83e5-514ae35da6b9	2	default
11	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:57:25.67057+05:30	0:0:0:0:0:0:0:1	f	\N	dd7da7b9-64f2-46e0-a7c5-9dbb15b5db35	1	default
12	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:58:19.058164+05:30	0:0:0:0:0:0:0:1	f	\N	ba0318a7-820e-41e4-8809-841baf2203a4	1	default
13	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:58:56.219818+05:30	0:0:0:0:0:0:0:1	f	\N	4f632bb4-bbfa-4b9f-be5e-016c123133bd	1	default
14	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:59:31.872445+05:30	0:0:0:0:0:0:0:1	f	\N	ec0a2821-3e59-4db4-8cbd-dddd07ef589c	1	default
15	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 15:59:45.343586+05:30	0:0:0:0:0:0:0:1	f	\N	f17109ab-daa9-4ad1-a632-9b6e3927984f	1	default
16	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 16:29:54.8542+05:30	0:0:0:0:0:0:0:1	f	\N	ad5b8142-0d92-4387-ab9a-83ec79c46e8a	1	default
17	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 16:29:55.324944+05:30	0:0:0:0:0:0:0:1	f	\N	bf97db85-6429-4017-a8a0-38365d947c40	2	default
18	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 16:29:55.673017+05:30	0:0:0:0:0:0:0:1	f	\N	93d77641-d5e7-43b5-b235-c9ece5130049	4	default
20	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 16:40:18.384524+05:30	0:0:0:0:0:0:0:1	f	\N	fe0d0e95-6a22-49e5-9bfa-07d68acaaa6d	1	default
19	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 16:33:16.848955+05:30	0:0:0:0:0:0:0:1	t	2026-10-28 16:43:40.094327+05:30	f5c7ebfe-55c1-4bc9-b663-c58d467ebe4c	2	default
22	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:47:55.150582+05:30	0:0:0:0:0:0:0:1	f	\N	d07993a6-6996-4eda-bfa1-34f63c6fc8a5	1	default
23	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:48:54.716104+05:30	0:0:0:0:0:0:0:1	f	\N	d0ea7fe1-ece5-4bc9-966e-98fd747b80d7	1	default
24	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:49:24.830119+05:30	0:0:0:0:0:0:0:1	f	\N	4a11da69-a799-42e1-be9c-47afc97d51b9	1	default
25	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:49:25.129206+05:30	0:0:0:0:0:0:0:1	f	\N	a0df7231-0419-412a-aecc-485c66af0a85	4	default
26	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:49:25.409406+05:30	0:0:0:0:0:0:0:1	f	\N	c36e947e-dbc0-4728-ab62-378c308bb2b1	3	default
27	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 17:49:25.688988+05:30	0:0:0:0:0:0:0:1	f	\N	6adab065-0a9b-42be-998f-7c10545e95ad	2	default
28	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:42.424875+05:30	0:0:0:0:0:0:0:1	f	\N	bfc22b72-7418-4c42-b828-20aae77f3382	2	default
29	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:42.454677+05:30	0:0:0:0:0:0:0:1	f	\N	baaae606-95e3-4861-9f6f-615ee9ca34fb	2	default
42	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 11:26:59.878123+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 11:31:09.145315+05:30	a7505a65-42b8-4551-a2a1-37366d64e574	4	default
30	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:42.458041+05:30	0:0:0:0:0:0:0:1	f	\N	039993b9-ce5d-451c-a483-f192807b41ad	2	default
31	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:42.462097+05:30	0:0:0:0:0:0:0:1	f	\N	4e056e5b-089b-401f-bea0-8cd18e80166e	2	default
52	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.521353+05:30	0:0:0:0:0:0:0:1	f	\N	ff9efa4b-afa4-4472-80a1-aad83bb1a565	2	default
32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:42.469114+05:30	0:0:0:0:0:0:0:1	f	\N	6cf7a7ae-915a-4951-949d-ed673f54797f	2	default
21	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 16:44:21.287447+05:30	0:0:0:0:0:0:0:1	t	2026-10-28 18:16:42.407955+05:30	e88c487f-53dd-4a40-93dd-67c4b72e2daa	2	default
110	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:38:12.019655+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 16:38:58.113977+05:30	959ff065-bbf1-4650-bbdf-355e0a6f2c54	2	default
111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:53:20.366692+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 16:53:27.102186+05:30	216f9a2e-d5f0-4d1b-89af-3ea57114afc4	1	default
292	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:41:04.759415+05:30	0:0:0:0:0:0:0:1	f	\N	a1ae90e3-0836-491c-8044-b1c46316457a	1	default
355	node	2026-11-10 16:47:08.631418+05:30	0:0:0:0:0:0:0:1	f	\N	b94acb70-066b-418d-bf55-fc2156be1c53	1	default
43	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 11:34:16.53259+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 11:36:08.596709+05:30	0e01c964-6053-4040-8564-595878f4a5f4	4	default
53	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.525077+05:30	0:0:0:0:0:0:0:1	f	\N	b9565f74-93d9-4fe5-93de-fcefc2723176	2	default
109	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:31.267563+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:06:32.104396+05:30	62d3bf03-1e65-4f0d-a4df-68167491f480	23	default
57	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.837105+05:30	0:0:0:0:0:0:0:1	f	\N	4414a0e1-c621-4725-9d80-382f2f04e869	2	default
59	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:37.205881+05:30	0:0:0:0:0:0:0:1	f	\N	69ce2792-b487-417f-a412-ccf33251c2da	1	default
60	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:37.786297+05:30	0:0:0:0:0:0:0:1	f	\N	eeb6dda2-cb19-4e9b-aef6-d2c45adb1cd4	2	default
61	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:38.18818+05:30	0:0:0:0:0:0:0:1	f	\N	51c0d11a-5403-4b63-964b-5eeef7e754ff	3	default
62	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:38.466808+05:30	0:0:0:0:0:0:0:1	f	\N	fc7d3d5f-8e95-4118-b589-804c4beba25a	4	default
63	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:40.194012+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:43:41.736712+05:30	a176905d-764d-4283-8bae-ce8b9438426f	8	default
64	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:40.929687+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:43:41.736712+05:30	26d9bceb-4e09-4d3e-8315-f56adf3d0792	8	default
65	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:43:42.295988+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:43:42.859711+05:30	7907427e-89c1-41dc-ad22-91eeee3622a5	8	default
96	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:46.316647+05:30	0:0:0:0:0:0:0:1	f	\N	5559fdc3-712c-4504-9fff-cc015da6fcaa	1	default
97	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:46.769608+05:30	0:0:0:0:0:0:0:1	f	\N	0cf65353-c07d-4694-b918-ba498cabc1c7	2	default
98	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:47.057042+05:30	0:0:0:0:0:0:0:1	f	\N	76c2ef1f-7bf2-4209-b523-29338a9cd886	3	default
99	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:47.339512+05:30	0:0:0:0:0:0:0:1	f	\N	1992cec0-6680-46c0-ac56-647b1a151e61	4	default
100	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:48.675638+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:04:50.033056+05:30	81933c69-e10f-47c6-9d8d-3f356b0f0e4f	20	default
101	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:49.263028+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:04:50.033056+05:30	2ae79944-9d2e-4cdc-96f3-45372c7afa5f	20	default
102	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:04:50.583319+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:04:51.783026+05:30	ba0e0559-8e0c-4dfd-9757-898cc7af34b3	20	default
103	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:27.260175+05:30	0:0:0:0:0:0:0:1	f	\N	2ba01ed6-3047-4c30-9c08-f720edf6e0f8	1	default
104	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:27.626897+05:30	0:0:0:0:0:0:0:1	f	\N	823b3cda-b136-47e6-9d66-ffeb6384fb32	2	default
105	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:27.909538+05:30	0:0:0:0:0:0:0:1	f	\N	1ff5c908-26a3-4caf-8af0-98fb443cb517	3	default
106	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:28.190758+05:30	0:0:0:0:0:0:0:1	f	\N	f31d61d2-a17b-4399-bb80-5abf855a7b21	4	default
107	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:29.376509+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:06:30.713277+05:30	7201e508-b662-4485-9d89-873dc464f49b	23	default
108	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:06:29.943708+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:06:30.713277+05:30	d4bd4b7e-888a-400b-aab9-96aac4471ee4	23	default
112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:53:29.624395+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 16:54:19.65638+05:30	3de84dc0-127d-454e-992b-afe3fd91efd1	2	default
114	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:56:21.87174+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 16:56:49.99514+05:30	ec1e3e95-719e-4d43-803a-7fac915a281a	2	default
150	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:31:11.597518+05:30	0:0:0:0:0:0:0:1	f	\N	13a4fc0a-c646-442b-adc4-b30f1ac27a01	3	default
152	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:32:00.685343+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:42:33.882413+05:30	2b057745-2eee-4ded-be68-f0ec0480f05f	2	default
149	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:30:19.500664+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:31:11.572997+05:30	c19a421e-620d-4ea0-98c5-b337f92f6f79	3	default
158	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 10:50:15.516031+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 10:51:45.524428+05:30	e1a660b0-11d2-47c7-b9ed-86974746a50c	2	default
159	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 10:51:48.001804+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 10:52:36.831243+05:30	bc0ed62b-0038-41fb-912b-4cb9e9703308	6	default
182	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.954895+05:30	0:0:0:0:0:0:0:1	f	\N	f65b325f-8a89-4f10-a8c9-33a52b1201c4	6	default
185	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.952884+05:30	0:0:0:0:0:0:0:1	f	\N	43a26f57-531b-4bee-8b56-93ea523fdb6b	6	default
293	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:41:24.942889+05:30	0:0:0:0:0:0:0:1	f	\N	63ad0206-1907-45b3-83e6-9f4112934dbb	1	default
203	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.73274+05:30	0:0:0:0:0:0:0:1	f	\N	d5f66ce2-8360-4228-a2ff-988d6f2ca2bf	6	default
34	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 18:33:48.937002+05:30	0:0:0:0:0:0:0:1	f	\N	2a771470-d161-4762-9d08-bb619876d052	1	default
35	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 18:39:32.669611+05:30	0:0:0:0:0:0:0:1	f	\N	fde4a478-c98d-49e6-bbc3-8cfd67a44070	1	default
36	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711	2026-11-04 18:40:08.169375+05:30	0:0:0:0:0:0:0:1	f	\N	85d3adae-3a0d-4398-a866-9cc2f14e7777	1	default
37	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-05 11:18:07.281595+05:30	0:0:0:0:0:0:0:1	f	\N	7c9b2f6c-5a5e-4f36-b34e-c4c5806443cf	2	default
38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-05 11:18:07.281595+05:30	0:0:0:0:0:0:0:1	f	\N	79ffa9e7-b8d5-4aed-9b7e-d95502677026	2	default
39	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-05 11:18:07.343788+05:30	0:0:0:0:0:0:0:1	f	\N	7dc62f4b-c171-4969-bf17-4cfaa3587d40	2	default
40	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-05 11:18:07.375444+05:30	0:0:0:0:0:0:0:1	f	\N	b3897e98-7a1b-4c96-9c42-d808fa18ca07	2	default
44	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 12:02:34.413319+05:30	0:0:0:0:0:0:0:1	f	\N	61dd1b3f-e50b-47d3-a66d-ccc9610d7da9	1	default
54	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.535767+05:30	0:0:0:0:0:0:0:1	f	\N	1a6543d8-777b-48f4-93f0-109083369c49	2	default
33	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	2026-11-04 18:16:45.007742+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 11:18:07.174611+05:30	a5c417ba-514c-4ba2-bbb3-2c19bda03518	2	default
113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:54:21.907554+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 16:56:18.321523+05:30	a5a88f45-1c76-43be-bb09-aa03965fa699	6	default
115	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 16:56:52.786048+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 17:03:15.211156+05:30	a8a40373-57bb-4225-a6ad-6cba92093188	6	default
151	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:31:11.612057+05:30	0:0:0:0:0:0:0:1	f	\N	3af3a452-37c6-4b11-a2b4-713bcae9f520	3	default
58	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.837105+05:30	0:0:0:0:0:0:0:1	f	\N	37790a48-8163-458b-8c5b-0dd25ab6ab13	2	default
66	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:41.812985+05:30	0:0:0:0:0:0:0:1	f	\N	44bfd57a-2df9-4418-999e-838b2ff13738	1	default
67	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:42.27748+05:30	0:0:0:0:0:0:0:1	f	\N	57cd7066-513b-49f8-9105-2a00cba6fb1e	2	default
68	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:42.58296+05:30	0:0:0:0:0:0:0:1	f	\N	7eb48113-6d17-4eaf-8731-1fa8911500b8	3	default
69	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:42.884699+05:30	0:0:0:0:0:0:0:1	f	\N	44e3b17e-7a61-4c7a-9ed7-48c77af84a2c	4	default
70	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:44.239353+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:50:45.597548+05:30	491c7294-aeb3-4467-a6d5-9f1b187e3f43	10	default
71	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:44.821455+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:50:45.597548+05:30	109599e3-3b6e-42cd-b474-7aa222af8211	10	default
72	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:50:46.15181+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:50:47.025142+05:30	ac7e68b0-b082-4996-9a25-24ea77099ada	10	default
73	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:53:27.63292+05:30	0:0:0:0:0:0:0:1	f	\N	4ebbaa23-2fa2-4914-9555-dd2753e79fa8	1	default
74	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:53:42.890943+05:30	0:0:0:0:0:0:0:1	f	\N	ad50e5ea-b0d4-4c85-8392-23af2e3c4900	2	default
160	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:17:57.002022+05:30	0:0:0:0:0:0:0:1	f	\N	6632ead9-cf03-4468-92bf-a63ba133bf9b	1	default
161	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:18:39.343214+05:30	0:0:0:0:0:0:0:1	f	\N	05de2478-8786-4c9e-b80c-c59eaac30a15	1	default
181	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.954895+05:30	0:0:0:0:0:0:0:1	f	\N	288c9fca-b073-448a-b6ad-a49aa1b7d04f	6	default
186	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.952884+05:30	0:0:0:0:0:0:0:1	f	\N	21b0b3b3-58c2-46ca-9f8f-3ba39575528f	6	default
326	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:14:07.867411+05:30	0:0:0:0:0:0:0:1	f	\N	6aa4fc3f-1908-4d25-bbbf-0bf7c54961d1	1	default
294	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:16:23.071449+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 18:41:53.712466+05:30	41810720-6f53-48d6-9095-af122d669276	2	default
317	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 12:27:01.910135+05:30	0:0:0:0:0:0:0:1	f	\N	fd1fab9d-b576-4f14-80d0-904445a1a7d2	1	default
187	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:20:19.849715+05:30	0:0:0:0:0:0:0:1	f	\N	eb42995b-67e2-4c87-a33f-b9024fbf7a9d	1	default
202	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.733266+05:30	0:0:0:0:0:0:0:1	f	\N	8ad599ee-41ec-43c6-b8e8-c316876c2379	6	default
205	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.73274+05:30	0:0:0:0:0:0:0:1	f	\N	5742cb1c-5bb4-45c0-ad7f-d66e5b054736	6	default
207	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.73274+05:30	0:0:0:0:0:0:0:1	f	\N	6445d89a-93dc-4664-b323-1019014674cc	6	default
344	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 15:22:41.810162+05:30	0:0:0:0:0:0:0:1	f	\N	cc446d5f-2cb8-403e-9cac-69b62d7422cd	1	default
332	node	2026-11-10 13:21:33.683923+05:30	0:0:0:0:0:0:0:1	f	\N	64c2d36e-17d5-4ad9-b2cd-e3de2c2dccde	1	default
45	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:01:32.99498+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:08:05.668783+05:30	00868a04-26fa-49f8-a7f0-85992fb3f61f	1	default
55	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.534249+05:30	0:0:0:0:0:0:0:1	f	\N	a6054686-bfdd-4cdc-a4ce-080cc61262de	2	default
116	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:19:50.221496+05:30	0:0:0:0:0:0:0:1	f	\N	efed9af8-9a55-4a4c-8728-0ab232b6c88e	1	default
75	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:18.769342+05:30	0:0:0:0:0:0:0:1	f	\N	6b578abf-bc35-4703-969c-79ccd47cacc8	1	default
76	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:19.219236+05:30	0:0:0:0:0:0:0:1	f	\N	c713120f-eec7-468a-8c54-ed8b2c692cc7	2	default
77	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:19.500439+05:30	0:0:0:0:0:0:0:1	f	\N	630842bc-96e8-4466-b8e9-0205a145f747	3	default
78	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:19.779013+05:30	0:0:0:0:0:0:0:1	f	\N	f5bd5095-da1d-414d-be8a-7728395923da	4	default
79	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:21.172724+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:56:22.524439+05:30	db768db1-3652-4dfd-8d33-5f5095301200	12	default
80	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:21.745881+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:56:22.524439+05:30	40139db2-bb26-4a3a-8603-9c3cd3d277bc	12	default
81	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 13:56:23.069496+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:56:23.96479+05:30	53ee9dd5-617a-42af-98d7-560818da8c2f	12	default
117	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:19:52.286487+05:30	0:0:0:0:0:0:0:1	f	\N	f87a83dd-1f9a-4ca2-ab0c-98d563a3bf29	25	default
118	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:19:52.824465+05:30	0:0:0:0:0:0:0:1	f	\N	ac82be1f-b554-40ae-b01f-728f0bd19a96	25	default
119	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:20:44.605797+05:30	0:0:0:0:0:0:0:1	f	\N	30813151-d872-4d70-abcc-497187554c83	1	default
120	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:20:46.485907+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:20:47.319931+05:30	3abc8366-b60d-4c5d-b965-99bac5b329ea	26	default
121	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:20:47.929403+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:20:49.788275+05:30	a592fb3f-4491-47ff-885d-9bb70f907bc0	26	default
122	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:20:50.074117+05:30	0:0:0:0:0:0:0:1	f	\N	fe82c3cc-7ac2-44d7-a75e-3f6f8b057e09	26	default
123	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:00.162673+05:30	0:0:0:0:0:0:0:1	f	\N	ab19634a-7830-42f0-bf1e-86e4b35d3ea2	1	default
124	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:00.528456+05:30	0:0:0:0:0:0:0:1	f	\N	294e14e1-86c3-40e1-8e83-4000bcc535dc	2	default
125	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:00.83004+05:30	0:0:0:0:0:0:0:1	f	\N	6f277cbb-db29-4869-8bd1-d6ba21b19ec2	3	default
126	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:01.127623+05:30	0:0:0:0:0:0:0:1	f	\N	2f991ad3-23fa-4b54-845f-e2f08be6d2d5	4	default
127	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:02.389698+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:21:03.730146+05:30	89818ea8-4d49-458e-b68b-1ce97e5dbbfe	28	default
128	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:21:02.960888+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:21:03.730146+05:30	f62b735d-4f03-4307-b0dc-00ce3930c35e	28	default
153	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:44:27.497735+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:46:06.384494+05:30	7ac5e0f6-2f2e-4c6d-93eb-13726aab7c51	2	default
162	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:20:38.712898+05:30	0:0:0:0:0:0:0:1	f	\N	cb2308db-1656-4150-ac9c-e15f9194fc7e	1	default
163	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:21:17.004669+05:30	0:0:0:0:0:0:0:1	f	\N	8270cd02-4cd3-4cb5-83f8-b21e9fdb87c1	1	default
164	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:21:28.975789+05:30	0:0:0:0:0:0:0:1	f	\N	18ebcd4f-fe82-4c84-8468-21e6ce769aa5	1	default
165	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:21:43.276609+05:30	0:0:0:0:0:0:0:1	f	\N	ddcf6d1f-8996-4deb-b791-65af019a1ca5	1	default
166	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:22:16.809849+05:30	0:0:0:0:0:0:0:1	f	\N	6a8f06e5-dbc6-4baf-85a1-c68457975bc3	1	default
167	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:22:29.810557+05:30	0:0:0:0:0:0:0:1	f	\N	cbd63c37-add4-4ac7-976a-332d246b55f3	1	default
168	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:22:59.947828+05:30	0:0:0:0:0:0:0:1	f	\N	ded8741f-9485-4837-ba40-6cc63eabe5cd	1	default
169	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:01.827499+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 12:23:02.59416+05:30	b12ebcd2-fdab-44ea-8abb-ae2087d64723	39	default
170	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:03.153791+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 12:23:04.979298+05:30	d5d364d7-7696-4048-ba7f-b2aa3c8d3cfd	39	default
171	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:05.244597+05:30	0:0:0:0:0:0:0:1	f	\N	e611d3f7-918b-42e0-99a7-7461c5e24a94	39	default
172	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:10.916717+05:30	0:0:0:0:0:0:0:1	f	\N	94dcf4a0-e427-4741-8391-887e6fd4c972	1	default
173	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:11.252237+05:30	0:0:0:0:0:0:0:1	f	\N	d8e6ab79-bb8c-45b1-91c2-00db90fdd953	2	default
295	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 18:40:37.876708+05:30	0:0:0:0:0:0:0:1	f	\N	1bde2d1f-cc32-4327-ab86-7c50e06f81f3	1	default
296	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 18:40:44.386597+05:30	0:0:0:0:0:0:0:1	f	\N	ba35f4ae-0878-4b68-a4f9-d4b847e3bed5	1	default
46	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:08:12.203145+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:18:14.90222+05:30	1c39b9c7-2c4e-4e55-862b-70db173ca9eb	2	default
48	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:19:00.687694+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:19:32.840937+05:30	4fcd8044-a1ed-4aaa-a041-23e6f6f5cb8e	2	default
50	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:20:28.808973+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:21:07.885539+05:30	4b2ce79e-5405-4c0e-b05d-33ae4ef7f855	6	default
129	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:18.372+05:30	0:0:0:0:0:0:0:1	f	\N	9bb989b0-ca84-4321-a729-2143fd18b8a2	1	default
56	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:39:48.56324+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:39:48.832104+05:30	a243d738-cc52-4562-9bfe-effe2a9c3134	2	default
82	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:20.135225+05:30	0:0:0:0:0:0:0:1	f	\N	7d08437d-6f9f-4adb-a525-4529b16b0680	1	default
83	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:20.605951+05:30	0:0:0:0:0:0:0:1	f	\N	ef443064-c62a-451c-885c-664b5333fae9	2	default
84	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:20.909749+05:30	0:0:0:0:0:0:0:1	f	\N	bcf4a59f-9236-4fea-83e3-f4aaac47d44f	3	default
85	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:21.196113+05:30	0:0:0:0:0:0:0:1	f	\N	51f55591-aeeb-409d-b6e7-71a6e56b6e82	4	default
86	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:22.494401+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:00:23.870006+05:30	36b6d3c8-9671-4e17-9270-c51c469065ed	14	default
87	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:23.070636+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:00:23.870006+05:30	a64b5ca5-d033-4ea0-9501-954d1552b4e5	14	default
88	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:00:24.405556+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:00:25.788927+05:30	9968e82f-781c-489e-a748-d1558c27cf6b	14	default
130	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:18.76794+05:30	0:0:0:0:0:0:0:1	f	\N	947529e2-11bd-4ccb-915e-888d7c3dcd4e	2	default
131	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:19.072158+05:30	0:0:0:0:0:0:0:1	f	\N	498600d0-04c6-4e38-aae7-bf09babeb1c6	3	default
132	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:19.346223+05:30	0:0:0:0:0:0:0:1	f	\N	6abb69db-d95b-4538-a94d-6157f6bd86da	4	default
133	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:20.7687+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:22:22.184814+05:30	4bb4ae08-d4db-4815-a1a5-37f03b4255cd	31	default
134	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:21.382558+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:22:22.184814+05:30	41a65c30-17a3-411c-9ce4-e75823a590ef	31	default
135	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:22:22.763019+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:22:24.204542+05:30	3468a67c-9aa0-4f43-abe3-61889e925ad0	31	default
155	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 19:03:46.92286+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 19:04:30.772704+05:30	ce1ec58b-860b-4bee-8f58-d8ea99453e58	6	default
156	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 19:04:33.65796+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 19:04:54.876789+05:30	f343bdf5-5825-433d-a79b-7bf3508f87cf	2	default
174	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:11.535884+05:30	0:0:0:0:0:0:0:1	f	\N	e57f9162-794e-4008-8f45-1e3aab0955de	3	default
175	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:11.818188+05:30	0:0:0:0:0:0:0:1	f	\N	6d2035e9-4a28-4276-9911-299615efddf3	4	default
176	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:13.005401+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 12:23:14.372075+05:30	9ccb7da9-11f4-4ae1-adf6-d0ab3e8b0fd8	41	default
177	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:13.601826+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 12:23:14.372075+05:30	88691340-eb61-424a-bf4e-d001b98a198b	41	default
178	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:23:14.900715+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 12:23:15.911094+05:30	1554314b-4ade-4cec-905e-8543ace802ab	41	default
183	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.953894+05:30	0:0:0:0:0:0:0:1	f	\N	ac6e7102-8dbe-4ff5-bd1a-811b44b2c5fb	6	default
191	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:24.132935+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:24:25.976003+05:30	5bb0a18d-168a-4384-8624-61ab156e7ea0	43	default
192	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:26.266738+05:30	0:0:0:0:0:0:0:1	f	\N	42b397c6-e134-4ae4-948b-790e4e61874c	43	default
188	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:15.260476+05:30	0:0:0:0:0:0:0:1	f	\N	800a485e-50c6-471d-8bee-4ced23f6f478	1	default
189	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:20.781327+05:30	0:0:0:0:0:0:0:1	f	\N	4b9f9308-7cdc-4b03-843e-f3471799f7e5	1	default
190	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:22.769062+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:24:23.581994+05:30	40e5432a-e929-4f08-bb01-39ce9aae0616	43	default
193	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:31.836077+05:30	0:0:0:0:0:0:0:1	f	\N	f6804547-3052-46d6-9cd3-db60ae19a9b6	1	default
194	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:40.631621+05:30	0:0:0:0:0:0:0:1	f	\N	4737d0d8-c7f9-477e-8471-8171d8041f14	1	default
195	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:40.967043+05:30	0:0:0:0:0:0:0:1	f	\N	4c77c84b-5333-42b4-9c6d-95a04ce0a1b1	2	default
196	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:41.250594+05:30	0:0:0:0:0:0:0:1	f	\N	c05e0cec-d364-403c-9b02-7e36a7e6a6c0	3	default
297	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 18:40:57.909994+05:30	0:0:0:0:0:0:0:1	f	\N	45ac765e-636f-404d-8665-a4e6c32a3feb	1	default
47	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:18:51.332555+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:18:57.256709+05:30	de159073-5cbd-48b7-9773-b4f2a2c4770a	6	default
49	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:19:40.426875+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:19:45.492255+05:30	502418c0-3a59-4aa1-8f93-8a09a84f76ba	6	default
136	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:23:39.322222+05:30	0:0:0:0:0:0:0:1	f	\N	0e6dba5b-a6c8-46d1-b774-09830e38d25b	1	default
137	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:16.073694+05:30	0:0:0:0:0:0:0:1	f	\N	fdd14e11-2885-4bad-926b-ba1e301b87b7	1	default
138	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:18.029495+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:24:18.87466+05:30	5decb01c-f704-488c-bab4-f41123c2a638	34	default
139	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:19.512248+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:24:21.38206+05:30	80a0d709-d43c-4329-b92e-1f74cdf8b6d7	34	default
140	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:21.816199+05:30	0:0:0:0:0:0:0:1	f	\N	e1b4b38f-bfd6-4942-8462-91f6ad4c41aa	34	default
141	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:31.587161+05:30	0:0:0:0:0:0:0:1	f	\N	ecd9cf7e-dcca-49d0-ab14-0599044f2446	1	default
41	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 11:18:08.147838+05:30	0:0:0:0:0:0:0:1	f	\N	13b55cdd-c256-4a6a-b9a9-79e9193f9ae5	1	default
142	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:31.956254+05:30	0:0:0:0:0:0:0:1	f	\N	f38ce193-3f35-45ff-9f6c-34cd0ae8d005	2	default
143	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:32.229086+05:30	0:0:0:0:0:0:0:1	f	\N	1ff43ee7-4e4c-4d9d-8dff-fcdba7d46632	3	default
51	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 13:21:10.484163+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 13:39:48.531254+05:30	c9e6de3c-38dd-464d-b98f-b3d1aa7632ef	2	default
89	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:01:57.891133+05:30	0:0:0:0:0:0:0:1	f	\N	93e5a970-c067-4587-9043-a0f3e9964ad5	1	default
90	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:01:58.491786+05:30	0:0:0:0:0:0:0:1	f	\N	8b591eeb-7df5-4019-9b55-f9806c3e29c1	2	default
91	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:01:58.783973+05:30	0:0:0:0:0:0:0:1	f	\N	3ec6346f-5d6b-4696-b22a-e478e71ea406	3	default
92	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:01:59.076406+05:30	0:0:0:0:0:0:0:1	f	\N	697ad3aa-d964-43e0-b2b7-ba7e295a5303	4	default
93	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:02:00.452309+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:02:01.843772+05:30	b6ab2104-c930-479c-8903-84239802f7fb	17	default
94	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:02:01.048061+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:02:01.843772+05:30	6a7c5cbf-ca8a-42ec-9a72-573f42c3a2f4	17	default
95	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 14:02:02.410454+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 14:02:03.713654+05:30	f1d1b978-3cdd-4d6f-bed2-3c94267eaad5	17	default
144	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:32.502709+05:30	0:0:0:0:0:0:0:1	f	\N	ecfb12a8-9fb6-46ee-833d-67d2c8e5403a	4	default
145	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:33.732132+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:24:35.074865+05:30	b150b38f-cd67-4897-af88-ba8f3577b42b	36	default
146	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:34.304873+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:24:35.074865+05:30	006264f4-19da-4a9e-a43e-2de7b4712b8f	36	default
147	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-05 18:24:35.612412+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:24:36.843416+05:30	c2d59c46-adb6-429a-87bd-c0623d884024	36	default
148	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:27:00.920464+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:30:15.496676+05:30	857772ee-2385-45ab-ae17-65cc91aef102	6	default
154	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 18:46:08.269797+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 18:47:09.502071+05:30	c9f64bc9-9a7d-401a-8764-df47df0c750e	6	default
157	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-05 19:04:57.460435+05:30	0:0:0:0:0:0:0:1	t	2026-10-29 19:05:08.536861+05:30	d58ee102-9821-4bbf-9804-bb378f49ffcb	6	default
180	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 12:35:20.239336+05:30	0:0:0:0:0:0:0:1	f	\N	14b6b492-2a5d-4443-a63a-beea536c6059	1	default
184	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 13:19:07.953894+05:30	0:0:0:0:0:0:0:1	f	\N	a3f98105-8e8d-4c20-a1fd-80ad1aa22f16	6	default
198	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:42.705274+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:24:44.056269+05:30	db2bb5e0-fb63-4f58-a925-33653a9103e0	45	default
199	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:43.285629+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:24:44.056269+05:30	470e6a6e-4d9d-4480-b757-c492d756ef7d	45	default
197	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:41.541703+05:30	0:0:0:0:0:0:0:1	f	\N	4254ab00-db8e-4b70-9cb9-99d3d9ee6495	4	default
179	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 12:26:17.528327+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:19:07.822967+05:30	ca4fad68-2702-44b5-a702-7e351017e098	6	default
200	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 13:24:44.596303+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 13:24:45.655697+05:30	62b9989b-bb72-4ba4-bccf-f3896f10b529	45	default
204	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.73274+05:30	0:0:0:0:0:0:0:1	f	\N	eb9f1921-c750-4499-b9f6-074653cdab03	6	default
206	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:14:44.733266+05:30	0:0:0:0:0:0:0:1	f	\N	92f79b09-9a93-4480-a9b7-7ed91ba2ac24	6	default
298	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:41:53.689921+05:30	0:0:0:0:0:0:0:1	f	\N	13f540ed-0906-4c8f-90a5-843dbbdf6e1f	2	default
299	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:41:53.724468+05:30	0:0:0:0:0:0:0:1	f	\N	ae3a48a2-6880-420b-b2cd-9073a70ae139	2	default
318	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 12:27:01.917705+05:30	0:0:0:0:0:0:0:1	f	\N	3e2b5534-a5be-47ad-8eb5-f117fad1cba4	1	default
201	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 15:17:03.495819+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:14:44.593543+05:30	4aa5eef5-0838-47ae-a589-92b6e9b079d7	6	default
327	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:19:02.371926+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 13:19:38.112911+05:30	7c4730f9-a5a5-4b24-91d0-71eaae98c2ef	3	default
335	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:22:39.231774+05:30	0:0:0:0:0:0:0:1	f	\N	0fa5a608-3e73-40c3-aa22-20f5709e0284	1	default
339	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:12.376069+05:30	0:0:0:0:0:0:0:1	f	\N	b03f9d58-9476-4aaf-9c70-4a3c3269f98d	2	default
345	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:32:41.837981+05:30	0:0:0:0:0:0:0:1	f	\N	8b14a955-5c68-411b-8c56-e262e9da1108	2	default
320	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 12:27:30.812234+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 13:11:31.0531+05:30	aa5ff04e-47c0-4d01-b464-119575f4ce64	2	default
343	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:14.908214+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 15:32:41.811852+05:30	0fc83d08-367d-4a5f-8eb8-e0f4a0cea73a	2	default
353	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:03.676179+05:30	0:0:0:0:0:0:0:1	f	\N	86a5a500-8371-4672-abff-0d07ed88f920	2	default
356	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:57:30.250421+05:30	0:0:0:0:0:0:0:1	f	\N	33e28730-6cb2-4728-ad79-a2742f867d57	2	default
300	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:41:53.751394+05:30	0:0:0:0:0:0:0:1	f	\N	b8be4ee7-bbf8-472d-b54e-e4be2a2946d2	2	default
319	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 12:27:01.920598+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 12:27:23.655735+05:30	c2665b37-0822-4846-b7c4-0e3c5a6c4d01	1	default
328	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:19:42.16302+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 13:20:11.730992+05:30	602714c6-e9c2-4937-b6c8-9fef7b02ba42	1	default
211	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:52.476831+05:30	0:0:0:0:0:0:0:1	f	\N	133a54c8-325a-4b59-8fcc-72291ec72a2a	2	default
215	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:54.841911+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:15:55.631292+05:30	ef558c45-5bcc-4140-a229-ad26815d1076	48	default
219	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:29:37.413962+05:30	0:0:0:0:0:0:0:1	f	\N	8abd4343-2dd3-45a7-bffe-7458860efc10	1	default
330	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:20:57.81726+05:30	0:0:0:0:0:0:0:1	f	\N	5da2ec98-294b-4021-9b45-ac972f9a1f96	1	default
340	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:12.380705+05:30	0:0:0:0:0:0:0:1	f	\N	b032fe86-7867-46ca-8fe9-45040bf2eb56	2	default
346	node	2026-11-10 15:49:08.836787+05:30	0:0:0:0:0:0:0:1	f	\N	f99cac71-f05b-46bd-8b31-2fd2077636c0	1	default
208	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:35.656108+05:30	0:0:0:0:0:0:0:1	f	\N	e4272769-b723-49d1-b767-7b6dafbadafe	1	default
301	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:41:53.757631+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 18:54:17.179116+05:30	16861262-1581-4417-bc20-f2f9d2a4bb98	2	default
321	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:11:31.139328+05:30	0:0:0:0:0:0:0:1	f	\N	bb74dbfe-f87d-42e7-b550-802205a989e9	2	default
324	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:11:31.139328+05:30	0:0:0:0:0:0:0:1	f	\N	651f9be9-5230-483e-b543-09592ce3bd7f	2	default
325	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:11:31.139328+05:30	0:0:0:0:0:0:0:1	f	\N	96e6566b-bc1b-4b66-ac2a-4bc7b84d422f	2	default
322	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:11:31.139328+05:30	0:0:0:0:0:0:0:1	f	\N	250040fd-43ae-4e50-918a-2a9e041c6406	2	default
329	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:20:23.443149+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 13:20:44.682922+05:30	9614b8b6-bd48-498b-be1b-3b0cdf635956	2	default
331	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:21:20.624785+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 13:21:36.175663+05:30	d095c0e9-7030-4865-9e4a-fcf0fd2d7599	2	default
341	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:12.392046+05:30	0:0:0:0:0:0:0:1	f	\N	06b97557-6ebd-475d-af53-71d9dab61246	2	default
333	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:21:53.332025+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 15:13:12.347157+05:30	63c78ba1-6475-4675-89fe-1f1ffac99074	2	default
347	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:00:01.837168+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 16:45:03.597764+05:30	eae35cbb-14e3-466e-b5a3-bbeffc770fe4	2	default
209	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:44.801676+05:30	0:0:0:0:0:0:0:1	f	\N	421ba8d1-9951-45d6-8f55-fe2b917ab0b8	1	default
210	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:52.122159+05:30	0:0:0:0:0:0:0:1	f	\N	d76f8390-fe38-43f9-8bdb-ac4c07947b3f	1	default
212	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:52.763962+05:30	0:0:0:0:0:0:0:1	f	\N	551e9f9d-86e9-4842-a387-d89e5e5bb0a0	3	default
218	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:29:27.367794+05:30	0:0:0:0:0:0:0:1	f	\N	892cf7d6-fd9b-44e7-bbe1-06ba3303fe6d	1	default
302	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-09 18:49:44.490097+05:30	0:0:0:0:0:0:0:1	f	\N	298a2896-af1f-4ec5-9f63-6287fbaec03c	1	default
334	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:22:12.582546+05:30	0:0:0:0:0:0:0:1	f	\N	1c5095a8-5f0e-40a8-9bc8-34bb09a6f8fa	1	default
342	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:12.391047+05:30	0:0:0:0:0:0:0:1	f	\N	24d2b05c-973e-4411-b4fc-edbc20d88ce9	2	default
348	node	2026-11-10 16:17:20.960927+05:30	0:0:0:0:0:0:0:1	f	\N	bb694f86-f367-4430-9a0b-db31aca43695	1	default
303	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 18:55:51.141807+05:30	0:0:0:0:0:0:0:1	t	2026-11-03 12:27:01.906618+05:30	354d74c6-3fab-42c9-b1b0-67fe091a173d	1	default
323	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 13:11:31.139328+05:30	0:0:0:0:0:0:0:1	f	\N	3044d3ac-5cff-4e0a-addc-e49086abc831	2	default
349	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:03.61003+05:30	0:0:0:0:0:0:0:1	f	\N	01df09df-4151-4d63-a426-b8385bc50278	2	default
213	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:53.055951+05:30	0:0:0:0:0:0:0:1	f	\N	022205f3-54c5-4d32-89da-c381ece6eb6d	4	default
214	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:54.250321+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:15:55.631292+05:30	b0e1e40d-30b6-43fc-a52b-4e6683ea20ec	48	default
217	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:23:18.808011+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:57:38.632548+05:30	ba987b0d-77f4-44e8-8466-fdfa1ecdedf7	6	default
304	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:08:00.641877+05:30	0:0:0:0:0:0:0:1	f	\N	99ee3b62-c7cd-4fe9-86aa-2923ad6619a4	1	default
336	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:23:35.925989+05:30	0:0:0:0:0:0:0:1	f	\N	8af120a7-cda9-4ab7-b0cf-0bc46da375d5	1	default
350	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:03.633153+05:30	0:0:0:0:0:0:0:1	f	\N	458e66b9-2f18-4379-bc27-9ad238431445	2	default
216	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:15:56.18026+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:15:57.360566+05:30	9de39b90-77cc-4d29-a6b8-db4ccb67e9b1	48	default
220	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:54:18.605167+05:30	0:0:0:0:0:0:0:1	f	\N	945d3c10-cf4c-45de-9fa4-890b59603d1a	1	default
221	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 16:57:38.638666+05:30	0:0:0:0:0:0:0:1	f	\N	8f03eb26-4ae7-4ed5-9b15-b62259e24c09	6	default
222	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:22.40108+05:30	0:0:0:0:0:0:0:1	f	\N	711455d7-bee3-4824-a7f6-b5fe27d16559	1	default
223	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:29.074685+05:30	0:0:0:0:0:0:0:1	f	\N	a7832782-31dd-421f-b120-f82e1b70d76f	1	default
224	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:30.965902+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:58:31.781512+05:30	8b46fd28-b759-4207-aaca-d1edc6a23b54	50	default
225	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:32.334691+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:58:34.15085+05:30	e572759b-7da4-48f2-959b-6f15bc6566b8	50	default
226	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:34.448835+05:30	0:0:0:0:0:0:0:1	f	\N	7367d975-cbff-4482-83f7-43a55bcd0260	50	default
227	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:39.003652+05:30	0:0:0:0:0:0:0:1	f	\N	8a4dfee7-32b2-4e74-80a9-f06f73e44cc3	1	default
228	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:46.42361+05:30	0:0:0:0:0:0:0:1	f	\N	f9179715-31d4-4c6c-94c7-fa8faa006ea8	1	default
229	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:52.317392+05:30	0:0:0:0:0:0:0:1	f	\N	e37b5b9f-cfdb-4821-89bc-fea2cc936ff0	1	default
230	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:52.65887+05:30	0:0:0:0:0:0:0:1	f	\N	779edf94-7735-49ba-8be6-0bfb4a295b80	2	default
231	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:52.951312+05:30	0:0:0:0:0:0:0:1	f	\N	0e39511a-1cd8-47df-9198-d3c71dae6985	3	default
232	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:53.239884+05:30	0:0:0:0:0:0:0:1	f	\N	ffcda8c8-2d57-46d7-959a-8a91d03ffba7	4	default
233	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:54.422914+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:58:55.801966+05:30	b7c6e057-ec1b-4dc3-aba0-d31ab7721dcd	52	default
234	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:55.020396+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:58:55.801966+05:30	536898c8-c7f0-4dd6-86aa-b26f1134d7e9	52	default
235	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 16:58:56.353227+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 16:58:57.436642+05:30	7cc96c69-376b-459c-9a30-0248fb80da8a	52	default
305	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:10:52.160256+05:30	0:0:0:0:0:0:0:1	f	\N	5b36a2c2-94c4-448c-9dca-9dd1f0a02262	1	default
337	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 13:26:31.177299+05:30	0:0:0:0:0:0:0:1	f	\N	8c04d9da-001c-43d0-bf65-a8444056bcdf	1	default
351	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:03.642295+05:30	0:0:0:0:0:0:0:1	f	\N	d28fb42b-0b31-44a2-909c-c711cd4d0322	2	default
236	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 17:31:14.738818+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 17:34:01.763836+05:30	879d97ee-1554-490a-a3cb-2307b9202109	2	default
237	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 17:34:07.11161+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 17:35:56.852245+05:30	54107372-4548-4cbd-b5ea-6a86622bbd2c	1	default
238	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:36:54.769153+05:30	0:0:0:0:0:0:0:1	f	\N	dd477d5b-e6de-49da-9c54-ca5b6cb279a8	1	default
239	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:02.72805+05:30	0:0:0:0:0:0:0:1	f	\N	85706dbb-7d48-4d4f-8a98-db0008f09923	1	default
240	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:09.208165+05:30	0:0:0:0:0:0:0:1	f	\N	92781ef8-98e2-4b7b-8904-758de92d4171	1	default
278	node	2026-11-09 16:57:41.565268+05:30	0:0:0:0:0:0:0:1	f	\N	7fcf44c0-3b76-4dcc-afcd-05f9fe87d4a1	2	default
241	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:09.528446+05:30	0:0:0:0:0:0:0:1	f	\N	80ba2394-5d5f-4430-a148-81e5e04ac228	2	default
242	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:09.814131+05:30	0:0:0:0:0:0:0:1	f	\N	a3293cc1-f9d3-4fec-ae93-ed013c26a35c	3	default
243	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:10.103936+05:30	0:0:0:0:0:0:0:1	f	\N	73f15f44-4740-46fa-9d47-1adcb8b2be80	4	default
244	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:11.300423+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 17:37:12.668678+05:30	0f54b984-996b-465b-9b42-d2c9040fac57	56	default
245	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:11.89391+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 17:37:12.668678+05:30	2fe18f35-5be7-410d-9421-8dfc157872aa	56	default
246	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:13.223806+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 17:37:14.319507+05:30	6228753c-d6c2-420c-9bba-a8ae1a3d3bfd	56	default
247	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 17:37:19.230436+05:30	0:0:0:0:0:0:0:1	f	\N	edb12614-2ba0-4e6d-b3f6-24ad67d5075f	1	default
248	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 18:22:01.02796+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 18:32:40.177398+05:30	3b83e57e-ec8a-4932-bb85-80664a375458	6	default
249	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-06 18:36:18.627312+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 18:37:37.627034+05:30	bf10983f-6510-476c-aef6-16e538167b67	2	default
250	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:43:25.991476+05:30	0:0:0:0:0:0:0:1	f	\N	d4015790-f131-47de-8477-5f01a2b4e62f	1	default
251	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:25.097026+05:30	0:0:0:0:0:0:0:1	f	\N	ff8be655-5c12-41b2-b149-84d8b9545399	1	default
252	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:33.841251+05:30	0:0:0:0:0:0:0:1	f	\N	c921bb7f-a2f1-4eab-9561-1facae9131d9	1	default
253	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:41.014825+05:30	0:0:0:0:0:0:0:1	f	\N	ebe537f4-025f-479e-8b62-b571557fd5c8	1	default
254	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:51.466765+05:30	0:0:0:0:0:0:0:1	f	\N	d2d995af-da91-4a3f-ad59-c5ec874a73a9	1	default
255	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:59.479627+05:30	0:0:0:0:0:0:0:1	f	\N	98698f60-6a3c-43a5-b2e1-053b3b6b54fe	1	default
256	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:46:59.813832+05:30	0:0:0:0:0:0:0:1	f	\N	6e534328-1797-40ef-abaf-22e4e2f25442	2	default
257	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:47:00.092581+05:30	0:0:0:0:0:0:0:1	f	\N	3c063543-8420-4bb2-86f5-695dfd35f451	3	default
258	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:47:00.357515+05:30	0:0:0:0:0:0:0:1	f	\N	e6647040-eff9-40b2-83fb-aa0bccb33cd0	4	default
259	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:47:01.54823+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 18:47:02.90175+05:30	a6a94181-225b-4563-845c-64c716a70d64	59	default
260	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:47:02.127601+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 18:47:02.90175+05:30	b8b24136-b582-48e3-a6d8-eb17529d0695	59	default
261	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-06 18:47:03.456496+05:30	0:0:0:0:0:0:0:1	t	2026-10-30 18:47:04.439492+05:30	768a7566-9029-4312-89f7-ead7b63813b8	59	default
262	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 11:53:55.007089+05:30	0:0:0:0:0:0:0:1	f	\N	c41f22a3-fd10-4db3-ade0-d6f7249e92fe	1	default
263	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:08:09.633038+05:30	0:0:0:0:0:0:0:1	f	\N	13d513df-ac8c-44fc-8528-86b57c806542	1	default
264	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:09.600508+05:30	0:0:0:0:0:0:0:1	f	\N	49eabda2-f6ae-4e9e-a414-822589dcf518	1	default
265	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:17.542564+05:30	0:0:0:0:0:0:0:1	f	\N	aa4069ce-1cb3-4b4d-8c6e-26346c6b8e0c	1	default
266	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:27.4249+05:30	0:0:0:0:0:0:0:1	f	\N	4b001e34-3c5d-481e-af7c-45ba70d74c15	1	default
267	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:34.57822+05:30	0:0:0:0:0:0:0:1	f	\N	8a12937b-617f-4bf5-9301-744b4d2bc5c1	1	default
268	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:41.059258+05:30	0:0:0:0:0:0:0:1	f	\N	3c843e1d-8dad-461f-8c37-ef2d8f24ddab	1	default
269	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:10:50.427764+05:30	0:0:0:0:0:0:0:1	f	\N	04132732-7a95-42d3-badc-0945f377d581	1	default
306	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:12:50.002524+05:30	0:0:0:0:0:0:0:1	f	\N	a72a0e45-d9fa-453b-9c43-f8ac982bd9be	1	default
307	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:13:02.7589+05:30	0:0:0:0:0:0:0:1	f	\N	ae79cea4-d269-4b04-84f4-c71195da85c4	1	default
308	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:13:13.378625+05:30	0:0:0:0:0:0:0:1	f	\N	06307c45-984d-416a-988b-5f0e0f353d6c	1	default
309	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:14:57.032725+05:30	0:0:0:0:0:0:0:1	f	\N	9052938b-a5d4-4c21-943a-c01ef344dd03	1	default
310	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:15:06.234433+05:30	0:0:0:0:0:0:0:1	f	\N	d13736e5-6d6d-4ee7-9e3e-be024f473b6d	1	default
311	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:15:16.269531+05:30	0:0:0:0:0:0:0:1	f	\N	47ea8043-4de1-47f7-83a2-bb2ed56898b7	1	default
312	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-10 12:15:25.322548+05:30	0:0:0:0:0:0:0:1	f	\N	81f01b84-37c0-4888-a6b8-abeb1a6c57b2	1	default
313	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 12:21:55.135085+05:30	0:0:0:0:0:0:0:1	f	\N	d24a69c9-44e1-49fb-bc65-b33fe9f0cb6c	1	default
270	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:11:38.156597+05:30	0:0:0:0:0:0:0:1	f	\N	da36754b-fb6c-47be-8b1a-5d186f2817fa	1	default
271	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:11:40.085297+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 12:11:40.846426+05:30	017f32ef-15a8-447a-98ba-c15dbe8df5a2	62	default
272	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:11:41.406849+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 12:11:43.212449+05:30	3c903a4b-1e13-4434-8f60-450afad33a61	62	default
273	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 12:11:43.489519+05:30	0:0:0:0:0:0:0:1	f	\N	bccd34fe-2d03-4a6e-9fe0-2890e66a5ebc	62	default
274	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 15:58:54.060722+05:30	0:0:0:0:0:0:0:1	f	\N	d434cfda-77f7-458f-8725-b20015a6687f	1	default
275	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 16:00:28.186785+05:30	0:0:0:0:0:0:0:1	f	\N	89346f13-e5da-4587-8bbd-76ae88aa6419	1	default
277	node	2026-11-09 16:55:36.57924+05:30	0:0:0:0:0:0:0:1	f	\N	095be197-f01e-4fc1-bba4-1b68d59d09f5	2	default
279	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 17:02:58.854547+05:30	0:0:0:0:0:0:0:1	f	\N	66973a0f-70fc-4e50-b36b-64a1656288c2	1	default
280	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:03:27.383049+05:30	0:0:0:0:0:0:0:1	f	\N	bc242d56-aea4-44c2-a07a-2d4eedff6d31	1	default
282	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 17:03:40.419828+05:30	0:0:0:0:0:0:0:1	f	\N	597a5ad2-c30c-4259-a073-a5c15ad1877f	2	default
314	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 12:23:13.123826+05:30	0:0:0:0:0:0:0:1	f	\N	cca6235c-5d5a-4397-af86-bcc8215692d9	1	default
276	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 16:47:39.21447+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 17:03:40.414479+05:30	603eebe7-49b1-479d-8f48-4aba04b27307	2	default
283	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 17:11:36.012052+05:30	0:0:0:0:0:0:0:1	f	\N	30330b81-8ac0-41e2-bb92-fb151ab8d053	1	default
284	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 17:15:46.271763+05:30	0:0:0:0:0:0:0:1	f	\N	f18c3416-13c6-42fb-b467-8c5e0723d946	1	default
285	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 17:19:43.1497+05:30	0:0:0:0:0:0:0:1	f	\N	0b4cd853-4e0f-432b-89fe-8ccf6f1d23cf	2	default
315	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36	2026-11-10 12:24:25.703076+05:30	0:0:0:0:0:0:0:1	f	\N	d6c3e25b-1314-4ad0-85b6-40891a06bf96	1	default
281	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 17:03:40.419828+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 17:19:43.150207+05:30	23916eea-d7c1-4509-8fe3-b1067d550cba	2	default
287	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9818	2026-11-09 17:22:13.776763+05:30	0:0:0:0:0:0:0:1	f	\N	e7ca66b3-70c2-41dd-945c-6d2093810fff	1	default
288	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:22:44.086928+05:30	0:0:0:0:0:0:0:1	f	\N	ea1ac894-b734-452d-bf42-9b4d65816178	1	default
289	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:23:01.342086+05:30	0:0:0:0:0:0:0:1	f	\N	a6a0b784-d56a-42fe-9075-d43c0c380b55	1	default
290	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0	2026-11-09 17:34:44.178279+05:30	0:0:0:0:0:0:0:1	f	\N	caca4d02-983f-4ced-a1a6-7b5253aaa5d3	1	default
291	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 17:40:25.76188+05:30	0:0:0:0:0:0:0:1	f	\N	0bc9c056-6d75-4ac0-85d8-2abaf17a980c	2	default
286	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-09 17:19:43.154748+05:30	0:0:0:0:0:0:0:1	t	2026-11-02 17:40:25.749714+05:30	ac556053-c6ce-431a-90e3-744c91e0b2a3	2	default
316	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 12:27:01.910135+05:30	0:0:0:0:0:0:0:1	f	\N	441ef58b-99c6-4d55-9ca7-90172abbff5d	1	default
338	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 15:13:12.377066+05:30	0:0:0:0:0:0:0:1	f	\N	c14cd2ca-e654-449f-82cb-502f2f240fd4	2	default
352	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:03.644355+05:30	0:0:0:0:0:0:0:1	f	\N	36b0d56e-081d-490e-aa14-5e3b658bccff	2	default
354	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	2026-11-10 16:45:07.112194+05:30	0:0:0:0:0:0:0:1	f	\N	92f3e034-61dd-420d-b921-b37d1dddceab	2	default
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
2	1
2	2
2	3
2	4
2	5
2	6
2	7
2	8
2	9
2	10
2	11
2	12
2	13
2	14
2	15
2	16
2	17
2	18
2	19
3	1
3	4
3	5
3	7
3	9
3	10
3	11
3	13
3	14
3	15
3	16
3	17
4	4
4	9
4	11
4	13
4	17
5	4
5	9
5	11
5	12
5	14
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, tenant_id, name, description, is_system_role, created_at, updated_at) FROM stdin;
1	default	ROLE_SUPER_ADMIN	Platform Administrator with complete access	t	2026-10-28 16:12:22.29038	2026-10-28 16:12:22.29038
2	default	ROLE_ADMIN	Tenant Administrator with management capabilities	t	2026-10-28 16:12:22.29038	2026-10-28 16:12:22.29038
3	default	ROLE_HR	HR Professional managing employee lifecycle	t	2026-10-28 16:12:22.29038	2026-10-28 16:12:22.29038
4	default	ROLE_MANAGER	Team Manager managing reports, approvals and timesheets	t	2026-10-28 16:12:22.29038	2026-10-28 16:12:22.29038
5	default	ROLE_EMPLOYEE	Standard Employee self-service role	t	2026-10-28 16:12:22.29038	2026-10-28 16:12:22.29038
\.


--
-- Data for Name: roster_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roster_assignments (id, tenant_id, employee_id, shift_id, effective_date, rotation_pattern, assigned_by_user_id, notes, status, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	41	3	2026-11-01	STANDARD	1	Scheduled morning shift for DevOps team	SWAPPED	2026-10-30 18:43:26.552339+05:30	2026-10-30 18:46:25.40179+05:30	admin@hrms.com	admin@hrms.com
2	default	40	2	2026-11-01	STANDARD	1	Scheduled night shift for 24/7 coverage	SWAPPED	2026-10-30 18:43:26.646688+05:30	2026-10-30 18:46:25.40179+05:30	admin@hrms.com	admin@hrms.com
3	default	43	3	2026-11-04	STANDARD	1	Scheduled morning shift for DevOps team	SWAPPED	2026-11-02 11:53:55.4021+05:30	2026-11-02 12:10:18.040615+05:30	admin@hrms.com	admin@hrms.com
4	default	42	2	2026-11-04	STANDARD	1	Scheduled night shift for 24/7 coverage	SWAPPED	2026-11-02 11:53:55.450415+05:30	2026-11-02 12:10:18.040615+05:30	admin@hrms.com	admin@hrms.com
5	default	45	2	2026-11-02	STANDARD	2		ACTIVE	2026-11-02 18:19:57.823146+05:30	2026-11-02 18:19:57.823146+05:30	hr@hrms.com	hr@hrms.com
6	default	45	2	2026-11-03	STANDARD	2		ACTIVE	2026-11-02 18:19:57.827626+05:30	2026-11-02 18:19:57.827626+05:30	hr@hrms.com	hr@hrms.com
7	default	45	2	2026-11-04	STANDARD	2		ACTIVE	2026-11-02 18:19:57.832637+05:30	2026-11-02 18:19:57.832637+05:30	hr@hrms.com	hr@hrms.com
8	default	45	2	2026-11-05	STANDARD	2		ACTIVE	2026-11-02 18:19:57.83667+05:30	2026-11-02 18:19:57.83667+05:30	hr@hrms.com	hr@hrms.com
9	default	45	2	2026-11-06	STANDARD	2		ACTIVE	2026-11-02 18:19:57.841196+05:30	2026-11-02 18:19:57.841196+05:30	hr@hrms.com	hr@hrms.com
10	default	45	2	2026-11-07	STANDARD	2		ACTIVE	2026-11-02 18:19:57.846318+05:30	2026-11-02 18:19:57.846318+05:30	hr@hrms.com	hr@hrms.com
11	default	45	2	2026-11-08	STANDARD	2		ACTIVE	2026-11-02 18:19:57.850269+05:30	2026-11-02 18:19:57.850269+05:30	hr@hrms.com	hr@hrms.com
\.


--
-- Data for Name: separation_clearances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.separation_clearances (id, tenant_id, separation_id, department_type, status, cleared_by, cleared_at, pending_dues, remarks, created_at, updated_at, created_by, updated_by) FROM stdin;
5	default	2	IT_ASSETS	CLEARED	admin@hrms.com	2026-10-30 13:24:16.068568	0.00	Departmental handover verified	2026-10-30 13:24:15.821212	2026-10-30 13:24:16.071099	admin@hrms.com	admin@hrms.com
6	default	2	FINANCE	CLEARED	admin@hrms.com	2026-10-30 13:24:16.096124	500.00	Travel advance balance deduction of 500 INR	2026-10-30 13:24:15.823245	2026-10-30 13:24:16.097122	admin@hrms.com	admin@hrms.com
7	default	2	HR_ADMIN	CLEARED	admin@hrms.com	2026-10-30 13:24:16.119671	0.00	Departmental handover verified	2026-10-30 13:24:15.824251	2026-10-30 13:24:16.121672	admin@hrms.com	admin@hrms.com
8	default	2	MANAGER	CLEARED	admin@hrms.com	2026-10-30 13:24:16.151686	0.00	Departmental handover verified	2026-10-30 13:24:15.825245	2026-10-30 13:24:16.155918	admin@hrms.com	admin@hrms.com
9	default	3	IT_ASSETS	CLEARED	admin@hrms.com	2026-10-30 16:15:45.190373	0.00	Departmental handover verified	2026-10-30 16:15:44.972213	2026-10-30 16:15:45.192372	admin@hrms.com	admin@hrms.com
10	default	3	FINANCE	CLEARED	admin@hrms.com	2026-10-30 16:15:45.215488	500.00	Travel advance balance deduction of 500 INR	2026-10-30 16:15:44.974796	2026-10-30 16:15:45.216497	admin@hrms.com	admin@hrms.com
11	default	3	HR_ADMIN	CLEARED	admin@hrms.com	2026-10-30 16:15:45.238712	0.00	Departmental handover verified	2026-10-30 16:15:44.975801	2026-10-30 16:15:45.23972	admin@hrms.com	admin@hrms.com
12	default	3	MANAGER	CLEARED	admin@hrms.com	2026-10-30 16:15:45.25847	0.00	Departmental handover verified	2026-10-30 16:15:44.976797	2026-10-30 16:15:45.25947	admin@hrms.com	admin@hrms.com
13	default	4	IT_ASSETS	CLEARED	admin@hrms.com	2026-10-30 16:29:27.671681	0.00	Departmental handover verified	2026-10-30 16:29:27.506266	2026-10-30 16:29:27.672361	admin@hrms.com	admin@hrms.com
14	default	4	FINANCE	CLEARED	admin@hrms.com	2026-10-30 16:29:27.687901	500.00	Travel advance balance deduction of 500 INR	2026-10-30 16:29:27.507231	2026-10-30 16:29:27.689172	admin@hrms.com	admin@hrms.com
15	default	4	HR_ADMIN	CLEARED	admin@hrms.com	2026-10-30 16:29:27.700967	0.00	Departmental handover verified	2026-10-30 16:29:27.508736	2026-10-30 16:29:27.700967	admin@hrms.com	admin@hrms.com
16	default	4	MANAGER	CLEARED	admin@hrms.com	2026-10-30 16:29:27.71504	0.00	Departmental handover verified	2026-10-30 16:29:27.509741	2026-10-30 16:29:27.716089	admin@hrms.com	admin@hrms.com
17	default	5	IT_ASSETS	CLEARED	admin@hrms.com	2026-10-30 16:58:46.841268	0.00	Departmental handover verified	2026-10-30 16:58:46.583419	2026-10-30 16:58:46.842264	admin@hrms.com	admin@hrms.com
18	default	5	FINANCE	CLEARED	admin@hrms.com	2026-10-30 16:58:46.889533	500.00	Travel advance balance deduction of 500 INR	2026-10-30 16:58:46.585456	2026-10-30 16:58:46.890099	admin@hrms.com	admin@hrms.com
19	default	5	HR_ADMIN	CLEARED	admin@hrms.com	2026-10-30 16:58:46.905837	0.00	Departmental handover verified	2026-10-30 16:58:46.586454	2026-10-30 16:58:46.906802	admin@hrms.com	admin@hrms.com
20	default	5	MANAGER	CLEARED	admin@hrms.com	2026-10-30 16:58:46.922485	0.00	Departmental handover verified	2026-10-30 16:58:46.587458	2026-10-30 16:58:46.923998	admin@hrms.com	admin@hrms.com
25	default	7	IT_ASSETS	CLEARED	admin@hrms.com	2026-10-30 18:46:51.859825	0.00	Departmental handover verified	2026-10-30 18:46:51.714761	2026-10-30 18:46:51.861824	admin@hrms.com	admin@hrms.com
26	default	7	FINANCE	CLEARED	admin@hrms.com	2026-10-30 18:46:51.877751	500.00	Travel advance balance deduction of 500 INR	2026-10-30 18:46:51.71576	2026-10-30 18:46:51.878752	admin@hrms.com	admin@hrms.com
27	default	7	HR_ADMIN	CLEARED	admin@hrms.com	2026-10-30 18:46:51.892836	0.00	Departmental handover verified	2026-10-30 18:46:51.717268	2026-10-30 18:46:51.893835	admin@hrms.com	admin@hrms.com
28	default	7	MANAGER	CLEARED	admin@hrms.com	2026-10-30 18:46:51.907872	0.00	Departmental handover verified	2026-10-30 18:46:51.718276	2026-10-30 18:46:51.908437	admin@hrms.com	admin@hrms.com
29	default	8	IT_ASSETS	CLEARED	admin@hrms.com	2026-11-02 12:10:27.785272	0.00	Departmental handover verified	2026-11-02 12:10:27.585498	2026-11-02 12:10:27.786779	admin@hrms.com	admin@hrms.com
30	default	8	FINANCE	CLEARED	admin@hrms.com	2026-11-02 12:10:27.805306	500.00	Travel advance balance deduction of 500 INR	2026-11-02 12:10:27.592674	2026-11-02 12:10:27.806314	admin@hrms.com	admin@hrms.com
31	default	8	HR_ADMIN	CLEARED	admin@hrms.com	2026-11-02 12:10:27.822554	0.00	Departmental handover verified	2026-11-02 12:10:27.594188	2026-11-02 12:10:27.823554	admin@hrms.com	admin@hrms.com
32	default	8	MANAGER	CLEARED	admin@hrms.com	2026-11-02 12:10:27.839521	0.00	Departmental handover verified	2026-11-02 12:10:27.595187	2026-11-02 12:10:27.840529	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: shift_swap_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shift_swap_requests (id, tenant_id, requester_employee_id, target_employee_id, requester_roster_id, target_roster_id, swap_date, reason, peer_status, manager_status, status, reviewed_by_user_id, manager_remarks, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	41	40	1	2	2026-11-01	Family commitment during morning hours, requesting swap with night shift.	PEER_ACCEPTED	APPROVED	APPROVED	1	Approved by Operations Lead. Ensure handoff notes are completed.	2026-10-30 18:43:26.732188+05:30	2026-10-30 18:43:26.979296+05:30	admin@hrms.com	admin@hrms.com
2	default	41	40	1	2	2026-11-01	Family commitment during morning hours, requesting swap with night shift.	PEER_ACCEPTED	APPROVED	APPROVED	1	Approved by Operations Lead. Ensure handoff notes are completed.	2026-10-30 18:46:25.327766+05:30	2026-10-30 18:46:25.40179+05:30	admin@hrms.com	admin@hrms.com
3	default	43	42	3	4	2026-11-04	Family commitment during morning hours, requesting swap with night shift.	PEER_ACCEPTED	APPROVED	APPROVED	1	Approved by Operations Lead. Ensure handoff notes are completed.	2026-11-02 11:53:55.538934+05:30	2026-11-02 11:53:55.672623+05:30	admin@hrms.com	admin@hrms.com
4	default	43	42	3	4	2026-11-04	Family commitment during morning hours, requesting swap with night shift.	PEER_ACCEPTED	APPROVED	APPROVED	1	Approved by Operations Lead. Ensure handoff notes are completed.	2026-11-02 12:10:17.933741+05:30	2026-11-02 12:10:18.0401+05:30	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shifts (id, tenant_id, name, shift_code, start_time, end_time, grace_period_mins, break_duration_mins, is_night_shift, night_allowance_rate, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	General Day Shift (HQ)	GEN_0918	09:00:00	18:00:00	15	60	f	0.00	t	2026-10-30 18:39:20.961735+05:30	2026-10-30 18:39:20.961735+05:30	\N	\N
2	default	Morning Early Shift	MORN_0615	06:00:00	15:00:00	15	60	f	150.00	t	2026-10-30 18:39:20.961735+05:30	2026-10-30 18:39:20.961735+05:30	\N	\N
3	default	Overnight Shift (24/7 Ops)	NIGHT_2106	21:00:00	06:00:00	15	60	t	500.00	t	2026-10-30 18:39:20.961735+05:30	2026-10-30 18:39:20.961735+05:30	\N	\N
4	default	DevOps On-Call Support (8819)	ONCALL_8819	18:00:00	02:00:00	20	45	t	400.00	t	2026-10-30 18:43:26.270615+05:30	2026-10-30 18:43:26.270615+05:30	admin@hrms.com	admin@hrms.com
5	default	DevOps On-Call Support (5876)	ONCALL_5876	18:00:00	02:00:00	20	45	t	400.00	t	2026-10-30 18:46:25.18845+05:30	2026-10-30 18:46:25.18845+05:30	admin@hrms.com	admin@hrms.com
6	default	DevOps On-Call Support (4938)	ONCALL_4938	18:00:00	02:00:00	20	45	t	400.00	t	2026-11-02 11:53:55.237178+05:30	2026-11-02 11:53:55.237178+05:30	admin@hrms.com	admin@hrms.com
7	default	DevOps On-Call Support (2041)	ONCALL_2041	18:00:00	02:00:00	20	45	t	400.00	t	2026-11-02 12:10:17.689296+05:30	2026-11-02 12:10:17.689296+05:30	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, tenant_id, ticket_number, employee_id, category, priority, status, title, description, asset_id, assigned_to, sla_deadline, resolution_notes, resolved_at, created_at, updated_at, created_by, updated_by) FROM stdin;
2	default	TKT-202610-2180	35	HARDWARE	HIGH	OPEN	External Monitor Flickering & HDMI Port Failure	Second screen loses sync every 5 minutes when compiling.	\N	\N	2026-10-31 00:54:18.957885	\N	\N	2026-10-30 16:54:18.957885	2026-10-30 16:54:18.957885	admin@hrms.com	admin@hrms.com
1	default	TKT-202610-9958	35	ACCESS_VPN	CRITICAL	RESOLVED	Production VPN Tunnel Timeout for DevOps	Unable to connect to internal staging Kubernetes cluster. Handshake timed out.	\N	\N	2026-10-30 20:54:18.880548	Issued new WireGuard client config and verified handshake. Latency is under 12ms.	2026-10-30 16:54:19.1058	2026-10-30 16:54:18.886102	2026-10-30 16:54:19.113753	admin@hrms.com	admin@hrms.com
4	default	TKT-202610-2082	35	HARDWARE	HIGH	OPEN	External Monitor Flickering & HDMI Port Failure	Second screen loses sync every 5 minutes when compiling.	\N	\N	2026-10-31 00:58:22.545927	\N	\N	2026-10-30 16:58:22.545927	2026-10-30 16:58:22.545927	admin@hrms.com	admin@hrms.com
3	default	TKT-202610-8375	35	ACCESS_VPN	CRITICAL	RESOLVED	Production VPN Tunnel Timeout for DevOps	Unable to connect to internal staging Kubernetes cluster. Handshake timed out.	\N	\N	2026-10-30 20:58:22.514424	Issued new WireGuard client config and verified handshake. Latency is under 12ms.	2026-10-30 16:58:22.624705	2026-10-30 16:58:22.514424	2026-10-30 16:58:22.629712	admin@hrms.com	admin@hrms.com
6	default	TKT-202610-2069	39	HARDWARE	HIGH	OPEN	External Monitor Flickering & HDMI Port Failure	Second screen loses sync every 5 minutes when compiling.	\N	\N	2026-10-31 01:37:02.91385	\N	\N	2026-10-30 17:37:02.91385	2026-10-30 17:37:02.91385	admin@hrms.com	admin@hrms.com
5	default	TKT-202610-5184	39	ACCESS_VPN	CRITICAL	RESOLVED	Production VPN Tunnel Timeout for DevOps	Unable to connect to internal staging Kubernetes cluster. Handshake timed out.	\N	\N	2026-10-30 21:37:02.839556	Issued new WireGuard client config and verified handshake. Latency is under 12ms.	2026-10-30 17:37:03.000664	2026-10-30 17:37:02.844117	2026-10-30 17:37:03.005703	admin@hrms.com	admin@hrms.com
8	default	TKT-202610-1184	41	HARDWARE	HIGH	OPEN	External Monitor Flickering & HDMI Port Failure	Second screen loses sync every 5 minutes when compiling.	\N	\N	2026-10-31 02:46:34.011686	\N	\N	2026-10-30 18:46:34.011686	2026-10-30 18:46:34.011686	admin@hrms.com	admin@hrms.com
7	default	TKT-202610-1712	41	ACCESS_VPN	CRITICAL	RESOLVED	Production VPN Tunnel Timeout for DevOps	Unable to connect to internal staging Kubernetes cluster. Handshake timed out.	\N	\N	2026-10-30 22:46:33.935076	Issued new WireGuard client config and verified handshake. Latency is under 12ms.	2026-10-30 18:46:34.104234	2026-10-30 18:46:33.939111	2026-10-30 18:46:34.110795	admin@hrms.com	admin@hrms.com
10	default	TKT-202611-5974	43	HARDWARE	HIGH	OPEN	External Monitor Flickering & HDMI Port Failure	Second screen loses sync every 5 minutes when compiling.	\N	\N	2026-11-02 20:10:34.759999	\N	\N	2026-11-02 12:10:34.759999	2026-11-02 12:10:34.759999	admin@hrms.com	admin@hrms.com
9	default	TKT-202611-4492	43	ACCESS_VPN	CRITICAL	RESOLVED	Production VPN Tunnel Timeout for DevOps	Unable to connect to internal staging Kubernetes cluster. Handshake timed out.	\N	\N	2026-11-02 16:10:34.664752	Issued new WireGuard client config and verified handshake. Latency is under 12ms.	2026-11-02 12:10:34.842315	2026-11-02 12:10:34.668753	2026-11-02 12:10:34.8474	admin@hrms.com	admin@hrms.com
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, description, setting_key, updated_at, setting_value, tenant_id) FROM stdin;
1	Enable dashboard birthday reminders	notifications.upcomingBirthdays	2026-10-28 15:58:56.437848	true	default
2	Maximum failed login attempts before lockout	security.maxLoginAttempts	2026-10-28 15:58:56.439865	5	default
3	Allow employees to self check in for attendance	attendance.selfCheckIn	2026-10-28 15:58:56.440913	true	default
\.


--
-- Data for Name: tax_declarations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_declarations (id, tenant_id, employee_id, financial_year, regime, declared_80c, declared_80d, declared_hra, status, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	1	2026-2027	NEW	150000.00	25000.00	180000.00	VERIFIED	2026-10-29 11:54:08.05845	\N	\N	\N
2	default	7	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 13:50:46.969322	2026-10-29 13:50:46.969322	testqa_updated_9453@hrms.com	testqa_updated_9453@hrms.com
3	default	8	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 13:56:23.902211	2026-10-29 13:56:23.902211	testqa_updated_7467@hrms.com	testqa_updated_7467@hrms.com
4	default	9	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 14:00:25.703238	2026-10-29 14:00:25.703238	testqa_updated_1062@hrms.com	testqa_updated_1062@hrms.com
5	default	11	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 14:02:03.663721	2026-10-29 14:02:03.663721	testqa_updated_2786@hrms.com	testqa_updated_2786@hrms.com
6	default	13	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 14:04:51.720525	2026-10-29 14:04:51.720525	testqa_updated_6626@hrms.com	testqa_updated_6626@hrms.com
7	default	15	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 14:06:32.073911	2026-10-29 14:06:32.073911	testqa_updated_2610@hrms.com	testqa_updated_2610@hrms.com
8	default	21	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 18:22:24.137298	2026-10-29 18:22:24.137298	testqa_updated_4795@hrms.com	testqa_updated_4795@hrms.com
9	default	25	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-29 18:24:36.782881	2026-10-29 18:24:36.782881	testqa_updated_9574@hrms.com	testqa_updated_9574@hrms.com
10	default	5	2026-2027	NEW	150000.00	25000.00	180000.00	VERIFIED	2026-10-29 18:29:46.0866	2026-10-29 18:29:46.0866	chelikamcharankumar@gmail.com	chelikamcharankumar@gmail.com
11	default	29	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 12:23:15.865765	2026-10-30 12:23:15.865765	testqa_updated_6871@hrms.com	testqa_updated_6871@hrms.com
12	default	32	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 13:24:45.614053	2026-10-30 13:24:45.614053	testqa_updated_5379@hrms.com	testqa_updated_5379@hrms.com
13	default	34	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 16:15:57.294222	2026-10-30 16:15:57.294222	testqa_updated_7964@hrms.com	testqa_updated_7964@hrms.com
14	default	37	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 16:58:57.395713	2026-10-30 16:58:57.395713	testqa_updated_3569@hrms.com	testqa_updated_3569@hrms.com
15	default	40	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 17:37:14.26375	2026-10-30 17:37:14.26375	testqa_updated_4278@hrms.com	testqa_updated_4278@hrms.com
16	default	42	2025-2026	NEW	0.00	0.00	0.00	VERIFIED	2026-10-30 18:47:04.398825	2026-10-30 18:47:04.398825	testqa_updated_6162@hrms.com	testqa_updated_6162@hrms.com
\.


--
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_settings (id, tenant_id, config_key, config_value, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenant_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenant_subscriptions (id, tenant_id, plan_name, max_employees, features, starts_at, expires_at, status, created_at) FROM stdin;
1	default	ENTERPRISE	5000	\N	2026-10-28 16:12:22.286352	\N	ACTIVE	2026-10-28 16:12:22.286352
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tenants (id, code, name, domain, status, subscription_tier, logo_url, primary_color, created_at, updated_at) FROM stdin;
default	DEFAULT	Apex Global Enterprises	apex.hrms.com	ACTIVE	ENTERPRISE	\N	#059669	2026-10-28 16:12:22.284183	2026-11-02 18:49:49.119711
\.


--
-- Data for Name: ticket_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_comments (id, tenant_id, ticket_id, author_id, comment_text, is_internal, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	1	1	Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal.	f	2026-10-30 16:54:19.0036	admin@hrms.com	2026-10-30 16:54:19.0036	admin@hrms.com
2	default	3	1	Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal.	f	2026-10-30 16:58:22.574669	admin@hrms.com	2026-10-30 16:58:22.574669	admin@hrms.com
3	default	5	1	Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal.	f	2026-10-30 17:37:02.947387	admin@hrms.com	2026-10-30 17:37:02.947387	admin@hrms.com
4	default	7	1	Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal.	f	2026-10-30 18:46:34.044662	admin@hrms.com	2026-10-30 18:46:34.044662	admin@hrms.com
5	default	9	1	Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal.	f	2026-11-02 12:10:34.79047	admin@hrms.com	2026-11-02 12:10:34.79047	admin@hrms.com
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	2
2	3
3	4
5	5
4	5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, created_at, created_by, updated_at, updated_by, account_locked_until, deleted, email, email_verified, email_verify_expiry, email_verify_token, failed_login_attempts, first_name, is_active, last_login_at, last_login_ip, last_name, password, password_changed_at, password_reset_expiry, password_reset_token_hash, profile_picture, role, totp_backup_codes, totp_enabled, totp_secret, tenant_id, must_change_password) FROM stdin;
8	2026-10-29 13:43:39.700735	hr@hrms.com	2026-10-29 13:43:42.297722	testqa_updated_9130@hrms.com	\N	f	testqa_updated_9130@hrms.com	f	\N	\N	0	QA	t	2026-10-29 13:43:42.293391	0:0:0:0:0:0:0:1	Lead	$2a$12$YOXpMZ1IVPJcngjRkNzZkeimPj8cdxCPZcoUZiV946m1bZljpRIde	2026-10-29 13:43:41.734198	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
5	2026-10-28 15:28:53.932658	SYSTEM	2026-10-28 15:33:12.675693	bapanaidusomineni@gmail.com	\N	f	bapanaidusomineni@gmail.com	f	2026-10-29 15:28:53.90968	$2a$12$nWevrOAcs02tOOfhXfuDU.FY6T7TMQILAjwxFudoMuV1DF2TBpll.	0	BAPANAIDU	t	2026-10-28 15:33:12.671177	0:0:0:0:0:0:0:1	SOMINENI	$2a$12$NgstlVBlW..NvLdsFrb7uOjZGW703gXY6TN5ZQJXZ67dnp8d52ft6	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
12	2026-10-29 13:56:20.809627	hr@hrms.com	2026-10-29 13:56:23.071178	testqa_updated_7467@hrms.com	\N	f	testqa_updated_7467@hrms.com	f	\N	\N	0	QA	t	2026-10-29 13:56:23.067036	0:0:0:0:0:0:0:1	Lead	$2a$12$v5u4G8bTagbrH32FdBRIhOFF//ak.A/1QOHfSNZLjgNyHB9w7s6Je	2026-10-29 13:56:22.522454	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
31	2026-10-29 18:22:20.42181	hr@hrms.com	2026-10-29 18:22:22.764788	testqa_updated_4795@hrms.com	\N	f	testqa_updated_4795@hrms.com	t	\N	\N	0	QA	t	2026-10-29 18:22:22.760928	0:0:0:0:0:0:0:1	Lead	$2a$12$X1DzTH3tAVz5DtEwILY8AeJ8Rg3lU2d2VbLNG8OX5YOIyFK2dvmPe	2026-10-29 18:22:22.182849	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
17	2026-10-29 14:02:00.113554	hr@hrms.com	2026-10-29 14:02:02.412073	testqa_updated_2786@hrms.com	\N	f	testqa_updated_2786@hrms.com	f	\N	\N	0	QA	t	2026-10-29 14:02:02.40796	0:0:0:0:0:0:0:1	Lead	$2a$12$12zLbTZ./lwdEU0Ou45eLevG3DEbosOO7KDNSMjZCrnN0/zf89S6q	2026-10-29 14:02:01.842231	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
18	2026-10-29 14:02:03.574857	hr@hrms.com	2026-10-29 14:02:03.574857	hr@hrms.com	\N	f	candidate_2786@example.com	f	\N	\N	0	Candidate	t	\N	\N	2786	$2a$12$aQkUW33.AKc6E7c1Or7sNelOI3kBOay080L8UCa6xTfFZTaKfrYFW	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
10	2026-10-29 13:50:43.92806	hr@hrms.com	2026-10-29 13:50:46.153543	testqa_updated_9453@hrms.com	\N	f	testqa_updated_9453@hrms.com	f	\N	\N	0	QA	t	2026-10-29 13:50:46.148659	0:0:0:0:0:0:0:1	Lead	$2a$12$gLhl2epYgRdmcQsxMkltW.DzxASIZzW7vfMXx0Hg.iyMMCdd.yl0u	2026-10-29 13:50:45.596545	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
14	2026-10-29 14:00:22.181663	hr@hrms.com	2026-10-29 14:00:24.407469	testqa_updated_1062@hrms.com	\N	f	testqa_updated_1062@hrms.com	f	\N	\N	0	QA	t	2026-10-29 14:00:24.402617	0:0:0:0:0:0:0:1	Lead	$2a$12$cE4ZPJnnkNlOrQczT2xgT.ocF.fz5y3Jk/KGmAPdQV3w5izWdE2F.	2026-10-29 14:00:23.869012	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
3	2026-10-28 13:00:55.739086	SYSTEM	2026-11-03 13:19:02.373643	manager@hrms.com	\N	f	manager@hrms.com	t	\N	\N	0	Vikram	t	2026-11-03 13:19:02.369296	0:0:0:0:0:0:0:1	Singh	$2a$12$aEDxc6nG1s9ySFm0xxE.AuBbDgLshWpUdtLBt20.QxJvQACfUW9vu	\N	\N	\N	\N	ROLE_MANAGER	\N	f	\N	default	f
36	2026-10-29 18:24:33.455274	hr@hrms.com	2026-10-29 18:24:35.613528	testqa_updated_9574@hrms.com	\N	f	testqa_updated_9574@hrms.com	t	\N	\N	0	QA	t	2026-10-29 18:24:35.610478	0:0:0:0:0:0:0:1	Lead	$2a$12$26WWyE6P3Oss7bDdnE3F7ew5r9rHQCaTYEbw.bkfKba4BZihBK2ry	2026-10-29 18:24:35.074865	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
15	2026-10-29 14:00:25.58915	hr@hrms.com	2026-10-29 14:00:25.58915	hr@hrms.com	\N	f	candidate_1062@example.com	f	\N	\N	0	Candidate	t	\N	\N	1062	$2a$12$xMPASCpYtuqzhXWDLe2ki.WWwgwDo5s0UKfJVBY0tPiuWReN8h/MS	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
28	2026-10-29 18:21:02.114467	hr@hrms.com	2026-10-29 18:21:03.732147	SYSTEM	\N	f	testqa_updated_3818@hrms.com	t	\N	\N	0	QA	t	2026-10-29 18:21:02.957887	0:0:0:0:0:0:0:1	Lead	$2a$12$5To6Y9haQqRFKUNXFQ/QRuSaWwWOFhJZdlfFeV3bVdmFvaRlxXTdK	2026-10-29 18:21:03.730146	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
26	2026-10-29 18:20:44.957874	admin@hrms.com	2026-10-29 18:20:50.076897	mnc_emp_7782@hrms.com	\N	f	mnc_emp_7782@hrms.com	t	\N	\N	0	Vikram	t	2026-10-29 18:20:50.071912	0:0:0:0:0:0:0:1	Sharma	$2a$12$AS.OmwkHrV2UlIATTsMh9uO5OyUGENruHDrfohAiZIpe8ThjrLP1m	2026-10-29 18:20:49.788275	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
20	2026-10-29 14:04:48.35836	hr@hrms.com	2026-10-29 14:04:50.585425	testqa_updated_6626@hrms.com	\N	f	testqa_updated_6626@hrms.com	f	\N	\N	0	QA	t	2026-10-29 14:04:50.580472	0:0:0:0:0:0:0:1	Lead	$2a$12$heQcsPx5U5.riK/PblcSiOP3OcCvSX8DjUE1jWOraOEyakxf2dH1S	2026-10-29 14:04:50.032055	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
21	2026-10-29 14:04:51.645448	hr@hrms.com	2026-10-29 14:04:51.645448	hr@hrms.com	\N	f	candidate_6626@example.com	f	\N	\N	0	Candidate	t	\N	\N	6626	$2a$12$vtzaHZBWKnZ4tu082GwY5OA5gk840UwhQCFoVzip.xATOajpR.BBW	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
23	2026-10-29 14:06:29.093227	hr@hrms.com	2026-10-29 14:06:31.268564	testqa_updated_2610@hrms.com	\N	f	testqa_updated_2610@hrms.com	f	\N	\N	0	QA	t	2026-10-29 14:06:31.265307	0:0:0:0:0:0:0:1	Lead	$2a$12$hzW7YXBEYN3tBmgGIo/EfOf0uOwMvVvqdcrI0lq9lnVzP6s2ILBpq	2026-10-29 14:06:30.712274	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
24	2026-10-29 14:06:32.013275	hr@hrms.com	2026-10-29 14:06:32.013275	hr@hrms.com	\N	f	candidate_2610@example.com	f	\N	\N	0	Candidate	t	\N	\N	2610	$2a$12$flXv1h5rdauY9ixPl8SCFex/C/uAPozFDzczo8NTAY6L18t37VlDW	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
25	2026-10-29 18:19:50.709365	admin@hrms.com	2026-10-29 18:19:52.826144	mnc_emp_3539@hrms.com	\N	f	mnc_emp_3539@hrms.com	t	\N	\N	0	Vikram	t	2026-10-29 18:19:52.822185	0:0:0:0:0:0:0:1	Sharma	$2a$12$82xM9d1TEOFhyMT/v1Wfu.8Jp84ZuZRC.XzIYp9zE.lRPRD76yBCu	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
29	2026-10-29 18:21:04.986237	hr@hrms.com	2026-10-29 18:21:04.986237	hr@hrms.com	\N	f	candidate_3818@example.com	t	\N	\N	0	Candidate	t	\N	\N	3818	$2a$12$GrFS9Y9ntOGM7SrhsCRAMeSqINgsXKrbILew3wcbpbjgwwCEvvQVu	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
32	2026-10-29 18:22:24.045553	hr@hrms.com	2026-10-29 18:22:24.045553	hr@hrms.com	\N	f	candidate_4795@example.com	t	\N	\N	0	Candidate	t	\N	\N	4795	$2a$12$is9j1ZdmZCF8f7yuVKN98uorkPUnAn5QvmA.T2IRHN0aqdhmjUuFK	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
38	2026-10-30 12:22:30.157608	admin@hrms.com	2026-10-30 12:22:30.157608	admin@hrms.com	\N	f	mnc_emp_1759@hrms.com	t	\N	\N	0	Vikram	t	\N	\N	Sharma	$2a$12$3TG/PskPJ4Ho/D7auFJBDuyz/NdsTgJw79IYomUT2bcResKVUJvny	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
34	2026-10-29 18:24:16.439523	admin@hrms.com	2026-10-29 18:24:21.820082	mnc_emp_6455@hrms.com	\N	f	mnc_emp_6455@hrms.com	t	\N	\N	0	Vikram	t	2026-10-29 18:24:21.814153	0:0:0:0:0:0:0:1	Sharma	$2a$12$PbFtrWVKLo0quQyCZze1eerHIk0haGyXqnRpA.80rQRLYwCNVAfTW	2026-10-29 18:24:21.381053	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
33	2026-10-29 18:23:39.742801	admin@hrms.com	2026-10-29 18:23:39.742801	admin@hrms.com	\N	f	mnc_emp_5340@hrms.com	t	\N	\N	0	Vikram	t	\N	\N	Sharma	$2a$12$FjlEYJs0P4gFlBOLIqeSzu7RJUDZpM3DAY1A5fWizWUV8E78BYFK2	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
2	2026-10-28 13:00:55.737073	SYSTEM	2026-11-03 16:57:30.291333	hr@hrms.com	\N	f	hr@hrms.com	t	\N	\N	0	Priya	t	2026-11-03 16:57:30.205066	0:0:0:0:0:0:0:1	Sharma	$2a$12$6xdu4tHjocnIShKK4BHkRuB1wYO23hEnbO65R3lig1yFGbJLl0Q2q	\N	\N	\N	/api/uploads/profiles/eada0645-ed1a-42f6-9bdd-802f1d85fe02-profile_avatar.jpg	ROLE_HR	\N	f	\N	default	f
37	2026-10-29 18:24:36.703411	hr@hrms.com	2026-10-29 18:24:36.703411	hr@hrms.com	\N	f	candidate_9574@example.com	t	\N	\N	0	Candidate	t	\N	\N	9574	$2a$12$H4S4583NEJ//PPSoLiN3LuCqdgt0ywvXlCkg3h1nf5WNpr/Klaq3y	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
4	2026-10-28 13:00:55.741087	SYSTEM	2026-10-30 18:47:00.358621	emp@hrms.com	\N	f	emp@hrms.com	t	\N	\N	0	Rahul	t	2026-10-30 18:47:00.355303	0:0:0:0:0:0:0:1	Kumar	$2a$12$HCtcq4Z4dJpjq54KffilUudgz9OscVtb6luuW8XxhSqg/cwYtUtQi	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
1	2026-10-28 13:00:55.732554	SYSTEM	2026-11-03 16:47:08.657049	admin@hrms.com	\N	f	admin@hrms.com	t	\N	\N	0	System	t	2026-11-03 16:47:08.576668	0:0:0:0:0:0:0:1	Admin	$2a$12$g7BJVpajtRlSVeHxIjLbjuR3rlTjuvYQc8n9NIvpIMKB0MGK3KOQm	\N	\N	\N	/api/uploads/profiles/a689b34c-016d-45d0-bd1d-0b8bc3f4b22e-profile_avatar.jpg	ROLE_ADMIN	\N	f	57WMNHVYYLF747R4ETJCWIMJER4UWIF6	default	f
39	2026-10-30 12:23:00.273235	admin@hrms.com	2026-10-30 12:23:05.246343	mnc_emp_3717@hrms.com	\N	f	mnc_emp_3717@hrms.com	t	\N	\N	0	Vikram	t	2026-10-30 12:23:05.241877	0:0:0:0:0:0:0:1	Sharma	$2a$12$XtMtm0vQ03hPcsm1uTs0.OTDPFTE2ZKvmbcfvKPSuzCWbQEwWbOCu	2026-10-30 12:23:04.978301	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
6	2026-10-29 13:16:54.16665	hr@hrms.com	2026-10-30 18:22:01.039333	chelikamcharankumar@gmail.com	\N	f	chelikamcharankumar@gmail.com	f	\N	\N	0	chelikam 	t	2026-10-30 18:22:01.023939	0:0:0:0:0:0:0:1	charan kumar	$2a$12$85T0BZDac57C81VLemG96u.2aRK.YD1cHaSmWZLd26bbjGZWYDSJ2	2026-10-29 16:38:50.782328	2026-10-29 16:54:06.102981	$2a$12$ClJYCww2qLOjDcqPIIfZPOWNRdGsh.SlFShFthVvE5o85xm0yvx9i	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
57	2026-10-30 17:37:14.182603	hr@hrms.com	2026-10-30 17:37:14.182603	hr@hrms.com	\N	f	candidate_4278@example.com	t	\N	\N	0	Candidate	t	\N	\N	4278	$2a$12$D4hW/RO4dz60PK051oXF.e.HlJXdTKGfRCckFbV4w7xpnfca5Pa.W	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
41	2026-10-30 12:23:12.714054	hr@hrms.com	2026-10-30 12:23:14.901843	testqa_updated_6871@hrms.com	\N	f	testqa_updated_6871@hrms.com	t	\N	\N	0	QA	t	2026-10-30 12:23:14.898127	0:0:0:0:0:0:0:1	Lead	$2a$12$H7QnX6MXbzZ3BtVSikDfsODIXN6/D4SVQTq7tNHcz6PUp1qGMIEAC	2026-10-30 12:23:14.370073	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
42	2026-10-30 12:23:15.809891	hr@hrms.com	2026-10-30 12:23:15.809891	hr@hrms.com	\N	f	candidate_6871@example.com	t	\N	\N	0	Candidate	t	\N	\N	6871	$2a$12$Ov083.vazI0VW.AwnzLuq.amIEV/H8SyzmICycjCHpnKwWsWzV4om	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
50	2026-10-30 16:58:29.397529	admin@hrms.com	2026-10-30 16:58:34.450467	mnc_emp_5453@hrms.com	\N	f	mnc_emp_5453@hrms.com	t	\N	\N	0	Vikram	t	2026-10-30 16:58:34.446166	0:0:0:0:0:0:0:1	Sharma	$2a$12$XFmKb4gafY7b2S31INecRetv7FJZ4V5fDvPnDyq5KrDx45lKXg2Ky	2026-10-30 16:58:34.149854	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
43	2026-10-30 13:24:21.110695	admin@hrms.com	2026-10-30 13:24:26.268474	mnc_emp_7411@hrms.com	\N	f	mnc_emp_7411@hrms.com	t	\N	\N	0	Vikram	t	2026-10-30 13:24:26.264352	0:0:0:0:0:0:0:1	Sharma	$2a$12$d5X/oHk1gJuO9G7kaSTWjO7f04gEqPKy4CtoRxhqFNUjjJLLgR6c2	2026-10-30 13:24:25.974499	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
45	2026-10-30 13:24:42.419269	hr@hrms.com	2026-10-30 13:24:44.597411	testqa_updated_5379@hrms.com	\N	f	testqa_updated_5379@hrms.com	t	\N	\N	0	QA	t	2026-10-30 13:24:44.594285	0:0:0:0:0:0:0:1	Lead	$2a$12$FRA2FWuePfxthxL.8hCM2.FdJHwL1ipIAPnTRJRrj6z6HR5u6zbkq	2026-10-30 13:24:44.056269	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
46	2026-10-30 13:24:45.539356	hr@hrms.com	2026-10-30 13:24:45.539356	hr@hrms.com	\N	f	candidate_5379@example.com	t	\N	\N	0	Candidate	t	\N	\N	5379	$2a$12$Va5FD2SlAljVWbyYDexJv.184dz9QMw2PkMRBFcvxB1zqBe9y/Lju	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
59	2026-10-30 18:47:01.251725	hr@hrms.com	2026-10-30 18:47:03.458278	testqa_updated_6162@hrms.com	\N	f	testqa_updated_6162@hrms.com	t	\N	\N	0	QA	t	2026-10-30 18:47:03.454993	0:0:0:0:0:0:0:1	Lead	$2a$12$jJbEvYMI5jMlrOKCAXmKZ.8v9UDMRepArpQtj5DUSmfmTGhefq.5a	2026-10-30 18:47:02.899786	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
52	2026-10-30 16:58:54.126968	hr@hrms.com	2026-10-30 16:58:56.354444	testqa_updated_3569@hrms.com	\N	f	testqa_updated_3569@hrms.com	t	\N	\N	0	QA	t	2026-10-30 16:58:56.350701	0:0:0:0:0:0:0:1	Lead	$2a$12$KlI/II3GQ.1dRi066RBb8u9bLaqSMepHUAwAdf250BfVsWoTu5P0K	2026-10-30 16:58:55.801966	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
48	2026-10-30 16:15:53.969505	hr@hrms.com	2026-10-30 16:15:56.181434	testqa_updated_7964@hrms.com	\N	f	testqa_updated_7964@hrms.com	t	\N	\N	0	QA	t	2026-10-30 16:15:56.177967	0:0:0:0:0:0:0:1	Lead	$2a$12$Fo/N0T4bTwLuyeOJZi6Hw.ft2AY3OZgJyNFxpvlyrBZNZtFRVTdx6	2026-10-30 16:15:55.631292	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
49	2026-10-30 16:15:57.214776	hr@hrms.com	2026-10-30 16:15:57.214776	hr@hrms.com	\N	f	candidate_7964@example.com	t	\N	\N	0	Candidate	t	\N	\N	7964	$2a$12$D8X7Ekmus29gzBouof/TjOAdJDLvVdG6ZBWjbtdopdP/SsmtgIvWm	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
53	2026-10-30 16:58:57.304861	hr@hrms.com	2026-10-30 16:58:57.304861	hr@hrms.com	\N	f	candidate_3569@example.com	t	\N	\N	0	Candidate	t	\N	\N	3569	$2a$12$bgpD47opUmVrcBuWG7pVLOg.RJXK0v0x9KOt6PsLzLKU1J8kMALoW	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
54	2026-10-30 17:33:02.782037	hr@hrms.com	2026-10-30 17:33:02.782037	hr@hrms.com	\N	f	rohan.mehta@example.com	t	\N	\N	0	Rohan	t	\N	\N	Mehta	$2a$12$EAPOV4KrdVa8TYROHO4Xxe2y1bqaHtGVVrHSttYmio/m7F2COspsu	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
60	2026-10-30 18:47:04.333283	hr@hrms.com	2026-10-30 18:47:04.333283	hr@hrms.com	\N	f	candidate_6162@example.com	t	\N	\N	0	Candidate	t	\N	\N	6162	$2a$12$Vd3sr4pEZ5g8qOFhlRHEe.NkSk4dYCGkuWJ4VT8jYbRVB7VnBqw8S	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
61	2026-11-02 12:10:50.746734	admin@hrms.com	2026-11-02 12:10:50.746734	admin@hrms.com	\N	f	mnc_emp_5274@hrms.com	t	\N	\N	0	Vikram	t	\N	\N	Sharma	$2a$12$NPdfnkQG7qToRFmJ2AC.duQtwQQKPgowHr/YIi94hIavTPyZIIXme	\N	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	t
56	2026-10-30 17:37:11.015676	hr@hrms.com	2026-10-30 17:37:13.225158	testqa_updated_4278@hrms.com	\N	f	testqa_updated_4278@hrms.com	t	\N	\N	0	QA	t	2026-10-30 17:37:13.221691	0:0:0:0:0:0:0:1	Lead	$2a$12$LQ.fdQgY7ksIVrXjq0uH9uY6Yf0R9fCnImXO1wPJMcy6bH0EnQ7si	2026-10-30 17:37:12.66764	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
62	2026-11-02 12:11:38.465513	admin@hrms.com	2026-11-02 12:11:43.490708	mnc_emp_1132@hrms.com	\N	f	mnc_emp_1132@hrms.com	t	\N	\N	0	Vikram	t	2026-11-02 12:11:43.487491	0:0:0:0:0:0:0:1	Sharma	$2a$12$D9FkxV5q1Tb26amnzJRVFeKpzVyc4wg131OEB2LNr8PiAvXlRsxNS	2026-11-02 12:11:43.212449	\N	\N	\N	ROLE_EMPLOYEE	\N	f	\N	default	f
\.


--
-- Data for Name: workflow_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_approvals (id, tenant_id, workflow_instance_id, step_order, approver_id, decision, comments, ip_address, decided_at, created_at, created_by, updated_at, updated_by) FROM stdin;
1	default	1	1	3	APPROVED	Approved by manager, proceed to HR	0:0:0:0:0:0:0:1	2026-10-28 17:49:26.008028	2026-10-28 17:49:26.010768	manager@hrms.com	2026-10-28 17:49:26.010768	manager@hrms.com
2	default	1	2	2	APPROVED	HR verification completed. Leave granted.	0:0:0:0:0:0:0:1	2026-10-28 17:49:26.064356	2026-10-28 17:49:26.06536	hr@hrms.com	2026-10-28 17:49:26.06536	hr@hrms.com
3	default	2	1	1	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-29 13:05:06.825175	2026-10-29 13:05:06.828177	admin@hrms.com	2026-10-29 13:05:06.828177	admin@hrms.com
4	default	3	1	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-29 18:35:31.181802	2026-10-29 18:35:31.184765	hr@hrms.com	2026-10-29 18:35:31.184765	hr@hrms.com
5	default	4	1	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-29 18:35:33.966903	2026-10-29 18:35:33.967902	hr@hrms.com	2026-10-29 18:35:33.967902	hr@hrms.com
6	default	5	1	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-29 18:35:50.531494	2026-10-29 18:35:50.532495	hr@hrms.com	2026-10-29 18:35:50.532495	hr@hrms.com
7	default	13	1	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-29 19:04:52.828313	2026-10-29 19:04:52.829413	hr@hrms.com	2026-10-29 19:04:52.829413	hr@hrms.com
8	default	18	1	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-30 10:50:58.324747	2026-10-30 10:50:58.327749	hr@hrms.com	2026-10-30 10:50:58.327749	hr@hrms.com
9	default	18	2	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-30 10:51:09.190596	2026-10-30 10:51:09.190596	hr@hrms.com	2026-10-30 10:51:09.190596	hr@hrms.com
10	default	13	2	2	APPROVED	Approved	0:0:0:0:0:0:0:1	2026-10-30 10:51:30.815875	2026-10-30 10:51:30.815875	hr@hrms.com	2026-10-30 10:51:30.815875	hr@hrms.com
\.


--
-- Data for Name: workflow_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_definitions (id, tenant_id, module_type, name, description, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	LEAVE	Standard Two-Tier Leave Approval	Requires direct Reporting Manager approval followed by HR verification	t	2026-10-28 17:33:48.898689	2026-10-28 17:33:48.898689	\N	\N
2	default	WORK_FROM_HOME	Work From Home Manager Approval	Direct Reporting Manager approval required for remote work days	t	2026-10-28 17:33:48.926089	2026-10-28 17:33:48.926089	\N	\N
\.


--
-- Data for Name: workflow_instances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_instances (id, tenant_id, workflow_definition_id, entity_type, entity_id, current_step_order, total_steps, status, initiated_by, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	1	LEAVE	1	2	2	APPROVED	4	2026-10-28 17:49:25.877577	2026-10-28 17:49:26.095584	emp@hrms.com	hr@hrms.com
2	default	2	WORK_FROM_HOME	1	1	1	APPROVED	4	2026-10-28 17:49:26.197358	2026-10-29 13:05:06.878799	emp@hrms.com	admin@hrms.com
6	default	2	WORK_FROM_HOME	4	1	1	PENDING	14	2026-10-29 14:00:25.089359	2026-10-29 14:00:25.089359	testqa_updated_1062@hrms.com	testqa_updated_1062@hrms.com
7	default	1	LEAVE	3	1	2	PENDING	17	2026-10-29 14:02:02.837745	2026-10-29 14:02:02.837745	testqa_updated_2786@hrms.com	testqa_updated_2786@hrms.com
8	default	2	WORK_FROM_HOME	5	1	1	PENDING	17	2026-10-29 14:02:03.06362	2026-10-29 14:02:03.06362	testqa_updated_2786@hrms.com	testqa_updated_2786@hrms.com
9	default	1	LEAVE	4	1	2	PENDING	20	2026-10-29 14:04:50.955041	2026-10-29 14:04:50.955041	testqa_updated_6626@hrms.com	testqa_updated_6626@hrms.com
10	default	2	WORK_FROM_HOME	6	1	1	PENDING	20	2026-10-29 14:04:51.170429	2026-10-29 14:04:51.170429	testqa_updated_6626@hrms.com	testqa_updated_6626@hrms.com
11	default	1	LEAVE	5	1	2	PENDING	23	2026-10-29 14:06:31.48862	2026-10-29 14:06:31.48862	testqa_updated_2610@hrms.com	testqa_updated_2610@hrms.com
12	default	2	WORK_FROM_HOME	7	1	1	PENDING	23	2026-10-29 14:06:31.59605	2026-10-29 14:06:31.59605	testqa_updated_2610@hrms.com	testqa_updated_2610@hrms.com
14	default	1	LEAVE	7	1	2	PENDING	31	2026-10-29 18:22:23.201669	2026-10-29 18:22:23.201669	testqa_updated_4795@hrms.com	testqa_updated_4795@hrms.com
15	default	2	WORK_FROM_HOME	8	1	1	PENDING	31	2026-10-29 18:22:23.508891	2026-10-29 18:22:23.508891	testqa_updated_4795@hrms.com	testqa_updated_4795@hrms.com
16	default	1	LEAVE	8	1	2	PENDING	36	2026-10-29 18:24:35.976615	2026-10-29 18:24:35.976615	testqa_updated_9574@hrms.com	testqa_updated_9574@hrms.com
17	default	2	WORK_FROM_HOME	9	1	1	PENDING	36	2026-10-29 18:24:36.190432	2026-10-29 18:24:36.190432	testqa_updated_9574@hrms.com	testqa_updated_9574@hrms.com
3	default	2	WORK_FROM_HOME	2	1	1	APPROVED	10	2026-10-29 13:50:46.647117	2026-10-29 18:35:31.210153	testqa_updated_9453@hrms.com	hr@hrms.com
4	default	2	WORK_FROM_HOME	3	1	1	APPROVED	12	2026-10-29 13:56:23.577608	2026-10-29 18:35:33.983258	testqa_updated_7467@hrms.com	hr@hrms.com
5	default	1	LEAVE	2	2	2	PENDING	14	2026-10-29 14:00:24.910846	2026-10-29 18:35:50.540491	testqa_updated_1062@hrms.com	hr@hrms.com
18	default	1	LEAVE	9	2	2	APPROVED	6	2026-10-29 19:04:29.291532	2026-10-30 10:51:09.234283	chelikamcharankumar@gmail.com	hr@hrms.com
13	default	1	LEAVE	6	2	2	APPROVED	6	2026-10-29 16:56:15.884141	2026-10-30 10:51:30.82976	chelikamcharankumar@gmail.com	hr@hrms.com
19	default	1	LEAVE	10	1	2	PENDING	41	2026-10-30 12:23:15.176317	2026-10-30 12:23:15.176317	testqa_updated_6871@hrms.com	testqa_updated_6871@hrms.com
20	default	2	WORK_FROM_HOME	10	1	1	PENDING	41	2026-10-30 12:23:15.365508	2026-10-30 12:23:15.365508	testqa_updated_6871@hrms.com	testqa_updated_6871@hrms.com
21	default	1	LEAVE	11	1	2	PENDING	45	2026-10-30 13:24:44.894937	2026-10-30 13:24:44.894937	testqa_updated_5379@hrms.com	testqa_updated_5379@hrms.com
22	default	2	WORK_FROM_HOME	11	1	1	PENDING	45	2026-10-30 13:24:45.07739	2026-10-30 13:24:45.07739	testqa_updated_5379@hrms.com	testqa_updated_5379@hrms.com
23	default	1	LEAVE	12	1	2	PENDING	48	2026-10-30 16:15:56.511476	2026-10-30 16:15:56.511476	testqa_updated_7964@hrms.com	testqa_updated_7964@hrms.com
24	default	2	WORK_FROM_HOME	12	1	1	PENDING	48	2026-10-30 16:15:56.73246	2026-10-30 16:15:56.73246	testqa_updated_7964@hrms.com	testqa_updated_7964@hrms.com
25	default	1	LEAVE	13	1	2	PENDING	52	2026-10-30 16:58:56.661008	2026-10-30 16:58:56.661008	testqa_updated_3569@hrms.com	testqa_updated_3569@hrms.com
26	default	2	WORK_FROM_HOME	13	1	1	PENDING	52	2026-10-30 16:58:56.827449	2026-10-30 16:58:56.827449	testqa_updated_3569@hrms.com	testqa_updated_3569@hrms.com
27	default	1	LEAVE	14	1	2	PENDING	56	2026-10-30 17:37:13.546876	2026-10-30 17:37:13.546876	testqa_updated_4278@hrms.com	testqa_updated_4278@hrms.com
28	default	2	WORK_FROM_HOME	14	1	1	PENDING	56	2026-10-30 17:37:13.742336	2026-10-30 17:37:13.742336	testqa_updated_4278@hrms.com	testqa_updated_4278@hrms.com
29	default	1	LEAVE	15	1	2	PENDING	59	2026-10-30 18:47:03.732478	2026-10-30 18:47:03.732478	testqa_updated_6162@hrms.com	testqa_updated_6162@hrms.com
30	default	2	WORK_FROM_HOME	15	1	1	PENDING	59	2026-10-30 18:47:03.906302	2026-10-30 18:47:03.906302	testqa_updated_6162@hrms.com	testqa_updated_6162@hrms.com
\.


--
-- Data for Name: workflow_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflow_steps (id, tenant_id, workflow_definition_id, step_order, step_name, approver_type, approver_role, sla_hours, is_auto_approved, created_at, updated_at, created_by, updated_by) FROM stdin;
1	default	1	1	Reporting Manager Approval	REPORTING_MANAGER	\N	48	f	2026-10-28 17:33:48.900732	2026-10-28 17:33:48.900732	\N	\N
2	default	1	2	HR Operations Verification	SPECIFIC_ROLE	ROLE_HR	24	f	2026-10-28 17:33:48.900732	2026-10-28 17:33:48.900732	\N	\N
3	default	2	1	Reporting Manager Approval	REPORTING_MANAGER	\N	24	f	2026-10-28 17:33:48.926577	2026-10-28 17:33:48.926577	\N	\N
\.


--
-- Name: announcement_acknowledgments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcement_acknowledgments_id_seq', 5, true);


--
-- Name: appraisal_cycles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appraisal_cycles_id_seq', 2, true);


--
-- Name: asset_allocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asset_allocations_id_seq', 3, true);


--
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.assets_id_seq', 4, true);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 35, true);


--
-- Name: attendance_regularizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_regularizations_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 45, true);


--
-- Name: biometric_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.biometric_devices_id_seq', 12, true);


--
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.candidates_id_seq', 22, true);


--
-- Name: company_announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_announcements_id_seq', 5, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 20, true);


--
-- Name: employee_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_documents_id_seq', 3, true);


--
-- Name: employee_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_goals_id_seq', 3, true);


--
-- Name: employee_leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_leave_balances_id_seq', 24, true);


--
-- Name: employee_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_requests_id_seq', 15, true);


--
-- Name: employee_separations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_separations_id_seq', 8, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 46, true);


--
-- Name: expense_claims_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_claims_id_seq', 4, true);


--
-- Name: flight_risk_evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.flight_risk_evaluations_id_seq', 43, true);


--
-- Name: full_and_final_settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.full_and_final_settlements_id_seq', 8, true);


--
-- Name: hr_policy_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hr_policy_articles_id_seq', 6, true);


--
-- Name: interview_scorecards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interview_scorecards_id_seq', 1, true);


--
-- Name: interview_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interview_sessions_id_seq', 6, true);


--
-- Name: job_openings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_openings_id_seq', 3, true);


--
-- Name: job_postings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_postings_id_seq', 7, true);


--
-- Name: leave_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_policies_id_seq', 6, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 15, true);


--
-- Name: login_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.login_history_id_seq', 349, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 26, true);


--
-- Name: office_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.office_locations_id_seq', 2, true);


--
-- Name: payroll_slips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payroll_slips_id_seq', 462, true);


--
-- Name: performance_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.performance_reviews_id_seq', 2, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 20, true);


--
-- Name: policy_acknowledgements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.policy_acknowledgements_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 356, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: roster_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roster_assignments_id_seq', 11, true);


--
-- Name: separation_clearances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.separation_clearances_id_seq', 32, true);


--
-- Name: shift_swap_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shift_swap_requests_id_seq', 4, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shifts_id_seq', 7, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 10, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 3, true);


--
-- Name: tax_declarations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tax_declarations_id_seq', 16, true);


--
-- Name: tenant_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tenant_settings_id_seq', 1, false);


--
-- Name: tenant_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tenant_subscriptions_id_seq', 1, true);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_comments_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 62, true);


--
-- Name: workflow_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_approvals_id_seq', 10, true);


--
-- Name: workflow_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_definitions_id_seq', 2, true);


--
-- Name: workflow_instances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_instances_id_seq', 30, true);


--
-- Name: workflow_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workflow_steps_id_seq', 3, true);


--
-- Name: announcement_acknowledgments announcement_acknowledgments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_acknowledgments
    ADD CONSTRAINT announcement_acknowledgments_pkey PRIMARY KEY (id);


--
-- Name: appraisal_cycles appraisal_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appraisal_cycles
    ADD CONSTRAINT appraisal_cycles_pkey PRIMARY KEY (id);


--
-- Name: asset_allocations asset_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_allocations
    ADD CONSTRAINT asset_allocations_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance_regularizations attendance_regularizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations
    ADD CONSTRAINT attendance_regularizations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: biometric_devices biometric_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_devices
    ADD CONSTRAINT biometric_devices_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: company_announcements company_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_announcements
    ADD CONSTRAINT company_announcements_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- Name: employee_goals employee_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_goals
    ADD CONSTRAINT employee_goals_pkey PRIMARY KEY (id);


--
-- Name: employee_leave_balances employee_leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_balances
    ADD CONSTRAINT employee_leave_balances_pkey PRIMARY KEY (id);


--
-- Name: employee_requests employee_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_pkey PRIMARY KEY (id);


--
-- Name: employee_separations employee_separations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_separations
    ADD CONSTRAINT employee_separations_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expense_claims expense_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT expense_claims_pkey PRIMARY KEY (id);


--
-- Name: flight_risk_evaluations flight_risk_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight_risk_evaluations
    ADD CONSTRAINT flight_risk_evaluations_pkey PRIMARY KEY (id);


--
-- Name: full_and_final_settlements full_and_final_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.full_and_final_settlements
    ADD CONSTRAINT full_and_final_settlements_pkey PRIMARY KEY (id);


--
-- Name: hr_policy_articles hr_policy_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hr_policy_articles
    ADD CONSTRAINT hr_policy_articles_pkey PRIMARY KEY (id);


--
-- Name: system_settings idx_ss_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT idx_ss_key UNIQUE (setting_key);


--
-- Name: interview_scorecards interview_scorecards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards
    ADD CONSTRAINT interview_scorecards_pkey PRIMARY KEY (id);


--
-- Name: interview_sessions interview_sessions_guest_access_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_guest_access_token_key UNIQUE (guest_access_token);


--
-- Name: interview_sessions interview_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_pkey PRIMARY KEY (id);


--
-- Name: interview_sessions interview_sessions_room_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_room_name_key UNIQUE (room_name);


--
-- Name: job_openings job_openings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_pkey PRIMARY KEY (id);


--
-- Name: job_postings job_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_pkey PRIMARY KEY (id);


--
-- Name: leave_policies leave_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT leave_policies_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: office_locations office_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.office_locations
    ADD CONSTRAINT office_locations_pkey PRIMARY KEY (id);


--
-- Name: payroll_slips payroll_slips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT payroll_slips_pkey PRIMARY KEY (id);


--
-- Name: performance_reviews performance_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: policy_acknowledgements policy_acknowledgements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roster_assignments roster_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_pkey PRIMARY KEY (id);


--
-- Name: separation_clearances separation_clearances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.separation_clearances
    ADD CONSTRAINT separation_clearances_pkey PRIMARY KEY (id);


--
-- Name: shift_swap_requests shift_swap_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: tax_declarations tax_declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_declarations
    ADD CONSTRAINT tax_declarations_pkey PRIMARY KEY (id);


--
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- Name: tenant_subscriptions tenant_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_code_key UNIQUE (code);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: ticket_comments ticket_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_pkey PRIMARY KEY (id);


--
-- Name: employees uk_9aw59jtyajbpyr0q02h20ahql; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_9aw59jtyajbpyr0q02h20ahql UNIQUE (employee_number);


--
-- Name: announcement_acknowledgments uk_announcement_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_acknowledgments
    ADD CONSTRAINT uk_announcement_user UNIQUE (tenant_id, announcement_id, user_id);


--
-- Name: attendance uk_att_emp_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT uk_att_emp_date UNIQUE (employee_id, date);


--
-- Name: biometric_devices uk_biometric_device; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_devices
    ADD CONSTRAINT uk_biometric_device UNIQUE (tenant_id, device_code);


--
-- Name: employee_leave_balances uk_elb_emp_type_yr; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_balances
    ADD CONSTRAINT uk_elb_emp_type_yr UNIQUE (tenant_id, employee_id, leave_type, year);


--
-- Name: refresh_tokens uk_ghpmfn23vmxfu3spu3lfg4r2d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT uk_ghpmfn23vmxfu3spu3lfg4r2d UNIQUE (token);


--
-- Name: employees uk_j2dmgsma6pont6kf7nic9elpd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_j2dmgsma6pont6kf7nic9elpd UNIQUE (user_id);


--
-- Name: departments uk_j6cwks7xecs5jov19ro8ge3qk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_j6cwks7xecs5jov19ro8ge3qk UNIQUE (name);


--
-- Name: employees uk_j9xgmd0ya5jmus09o0b8pqrpb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_j9xgmd0ya5jmus09o0b8pqrpb UNIQUE (email);


--
-- Name: departments uk_l7tivi5261wxdnvo6cct9gg6t; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uk_l7tivi5261wxdnvo6cct9gg6t UNIQUE (code);


--
-- Name: leave_policies uk_lp_tenant_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT uk_lp_tenant_type UNIQUE (tenant_id, leave_type);


--
-- Name: policy_acknowledgements uk_pa_doc_emp; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT uk_pa_doc_emp UNIQUE (tenant_id, document_id, employee_id);


--
-- Name: payroll_slips uk_payroll; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT uk_payroll UNIQUE (employee_id, payroll_month, payroll_year);


--
-- Name: permissions uk_permission_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uk_permission_name UNIQUE (name);


--
-- Name: roster_assignments uk_roster_emp_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT uk_roster_emp_date UNIQUE (tenant_id, employee_id, effective_date);


--
-- Name: shifts uk_shifts_tenant_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT uk_shifts_tenant_code UNIQUE (tenant_id, shift_code);


--
-- Name: tenants uk_tenant_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT uk_tenant_code UNIQUE (code);


--
-- Name: roles uk_tenant_role; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_tenant_role UNIQUE (tenant_id, name);


--
-- Name: tenant_settings uk_tenant_setting; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT uk_tenant_setting UNIQUE (tenant_id, config_key);


--
-- Name: users uk_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_email UNIQUE (email);


--
-- Name: workflow_steps uk_ws_def_order; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT uk_ws_def_order UNIQUE (workflow_definition_id, step_order);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_approvals workflow_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_pkey PRIMARY KEY (id);


--
-- Name: workflow_definitions workflow_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT workflow_definitions_pkey PRIMARY KEY (id);


--
-- Name: workflow_instances workflow_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: idx_al_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_al_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_al_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_al_time ON public.audit_logs USING btree (performed_at);


--
-- Name: idx_al_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_al_user ON public.audit_logs USING btree (performed_by);


--
-- Name: idx_announcements_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_pinned ON public.company_announcements USING btree (tenant_id, pinned);


--
-- Name: idx_announcements_tenant_pub; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_tenant_pub ON public.company_announcements USING btree (tenant_id, published_at);


--
-- Name: idx_appraisal_cycles_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appraisal_cycles_tenant ON public.appraisal_cycles USING btree (tenant_id, status);


--
-- Name: idx_asset_allocations_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_asset_allocations_tenant ON public.asset_allocations USING btree (tenant_id, employee_id, allocation_status);


--
-- Name: idx_assets_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assets_tenant ON public.assets USING btree (tenant_id, asset_tag);


--
-- Name: idx_att_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_att_date ON public.attendance USING btree (date);


--
-- Name: idx_att_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_att_emp ON public.attendance USING btree (employee_id);


--
-- Name: idx_att_reg_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_att_reg_tenant_emp ON public.attendance_regularizations USING btree (tenant_id, employee_id, status);


--
-- Name: idx_att_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_att_status ON public.attendance USING btree (status);


--
-- Name: idx_att_tenant_emp_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_att_tenant_emp_date ON public.attendance USING btree (tenant_id, employee_id, date);


--
-- Name: idx_audit_tenant_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_tenant_time ON public.audit_logs USING btree (tenant_id, performed_at);


--
-- Name: idx_biometric_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_biometric_tenant ON public.biometric_devices USING btree (tenant_id);


--
-- Name: idx_cand_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cand_job ON public.candidates USING btree (job_posting_id);


--
-- Name: idx_cand_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cand_stage ON public.candidates USING btree (stage);


--
-- Name: idx_dept_tenant_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dept_tenant_code ON public.departments USING btree (tenant_id, code);


--
-- Name: idx_ed_emp_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ed_emp_cat ON public.employee_documents USING btree (tenant_id, employee_id, category);


--
-- Name: idx_ed_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ed_expiry ON public.employee_documents USING btree (tenant_id, expiry_date);


--
-- Name: idx_elb_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_elb_tenant_emp ON public.employee_leave_balances USING btree (tenant_id, employee_id, year);


--
-- Name: idx_emp_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_dept ON public.employees USING btree (department_id);


--
-- Name: idx_emp_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_email ON public.employees USING btree (email);


--
-- Name: idx_emp_manager; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_manager ON public.employees USING btree (manager_id);


--
-- Name: idx_emp_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_number ON public.employees USING btree (employee_number);


--
-- Name: idx_emp_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_status ON public.employees USING btree (employment_status);


--
-- Name: idx_emp_tenant_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_tenant_number ON public.employees USING btree (tenant_id, employee_number);


--
-- Name: idx_emp_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emp_tenant_status ON public.employees USING btree (tenant_id, employment_status);


--
-- Name: idx_employee_goals_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_goals_tenant ON public.employee_goals USING btree (tenant_id, employee_id, cycle_id);


--
-- Name: idx_employee_separations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_separations_status ON public.employee_separations USING btree (tenant_id, status);


--
-- Name: idx_employee_separations_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_separations_tenant_emp ON public.employee_separations USING btree (tenant_id, employee_id);


--
-- Name: idx_er_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_er_tenant_emp ON public.employee_requests USING btree (tenant_id, employee_id, status);


--
-- Name: idx_exp_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_date ON public.expense_claims USING btree (expense_date);


--
-- Name: idx_exp_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_tenant_emp ON public.expense_claims USING btree (tenant_id, employee_id);


--
-- Name: idx_exp_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exp_tenant_status ON public.expense_claims USING btree (tenant_id, status);


--
-- Name: idx_flight_risk_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flight_risk_emp ON public.flight_risk_evaluations USING btree (tenant_id, employee_id);


--
-- Name: idx_flight_risk_tenant_lvl; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flight_risk_tenant_lvl ON public.flight_risk_evaluations USING btree (tenant_id, risk_level);


--
-- Name: idx_fnf_settlements_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fnf_settlements_tenant_emp ON public.full_and_final_settlements USING btree (tenant_id, employee_id);


--
-- Name: idx_hr_policy_tenant_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_policy_tenant_active ON public.hr_policy_articles USING btree (tenant_id, is_active);


--
-- Name: idx_hr_policy_tenant_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hr_policy_tenant_cat ON public.hr_policy_articles USING btree (tenant_id, category);


--
-- Name: idx_interview_scorecards_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interview_scorecards_tenant ON public.interview_scorecards USING btree (tenant_id, candidate_id);


--
-- Name: idx_interview_sessions_candidate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interview_sessions_candidate ON public.interview_sessions USING btree (candidate_id);


--
-- Name: idx_interview_sessions_guest_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interview_sessions_guest_token ON public.interview_sessions USING btree (guest_access_token);


--
-- Name: idx_interview_sessions_interviewer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interview_sessions_interviewer ON public.interview_sessions USING btree (interviewer_id);


--
-- Name: idx_interview_sessions_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interview_sessions_tenant ON public.interview_sessions USING btree (tenant_id, scheduled_start);


--
-- Name: idx_job_openings_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_openings_tenant ON public.job_openings USING btree (tenant_id, status);


--
-- Name: idx_jp_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jp_dept ON public.job_postings USING btree (department_id);


--
-- Name: idx_jp_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jp_status ON public.job_postings USING btree (status);


--
-- Name: idx_leaves_tenant_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaves_tenant_emp ON public.leave_requests USING btree (tenant_id, employee_id);


--
-- Name: idx_lh_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lh_status ON public.login_history USING btree (status);


--
-- Name: idx_lh_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lh_user_time ON public.login_history USING btree (user_id, login_at);


--
-- Name: idx_lp_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lp_tenant ON public.leave_policies USING btree (tenant_id);


--
-- Name: idx_lr_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lr_dates ON public.leave_requests USING btree (start_date, end_date);


--
-- Name: idx_lr_emp_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lr_emp_status ON public.leave_requests USING btree (employee_id, status);


--
-- Name: idx_notif_tenant_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_tenant_user ON public.notifications USING btree (tenant_id, user_id, is_read);


--
-- Name: idx_notif_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_time ON public.notifications USING btree (created_at);


--
-- Name: idx_notif_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_ol_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ol_tenant ON public.office_locations USING btree (tenant_id);


--
-- Name: idx_payroll_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payroll_emp ON public.payroll_slips USING btree (employee_id);


--
-- Name: idx_payroll_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payroll_period ON public.payroll_slips USING btree (payroll_year, payroll_month);


--
-- Name: idx_payroll_tenant_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payroll_tenant_period ON public.payroll_slips USING btree (tenant_id, employee_id, payroll_year, payroll_month);


--
-- Name: idx_pr_cycle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_cycle ON public.performance_reviews USING btree (review_cycle);


--
-- Name: idx_pr_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pr_emp ON public.performance_reviews USING btree (employee_id);


--
-- Name: idx_roles_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roles_tenant ON public.roles USING btree (tenant_id);


--
-- Name: idx_roster_emp_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_emp_date ON public.roster_assignments USING btree (tenant_id, employee_id, effective_date);


--
-- Name: idx_roster_tenant_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_tenant_date ON public.roster_assignments USING btree (tenant_id, effective_date);


--
-- Name: idx_rt_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rt_expiry ON public.refresh_tokens USING btree (expiry_date);


--
-- Name: idx_rt_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rt_token ON public.refresh_tokens USING btree (token);


--
-- Name: idx_rt_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rt_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_separation_clearances_sep; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_separation_clearances_sep ON public.separation_clearances USING btree (separation_id);


--
-- Name: idx_shifts_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shifts_tenant ON public.shifts USING btree (tenant_id, is_active);


--
-- Name: idx_support_tickets_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_assigned ON public.support_tickets USING btree (tenant_id, assigned_to);


--
-- Name: idx_support_tickets_emp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_emp ON public.support_tickets USING btree (tenant_id, employee_id);


--
-- Name: idx_support_tickets_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_tickets_tenant_status ON public.support_tickets USING btree (tenant_id, status);


--
-- Name: idx_swap_requester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_swap_requester ON public.shift_swap_requests USING btree (tenant_id, requester_employee_id);


--
-- Name: idx_swap_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_swap_target ON public.shift_swap_requests USING btree (tenant_id, target_employee_id);


--
-- Name: idx_swap_tenant_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_swap_tenant_status ON public.shift_swap_requests USING btree (tenant_id, status);


--
-- Name: idx_tax_declarations_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_declarations_tenant ON public.tax_declarations USING btree (tenant_id, employee_id, financial_year);


--
-- Name: idx_ticket_comments_ticket; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_comments_ticket ON public.ticket_comments USING btree (ticket_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_tenant_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_tenant_email ON public.users USING btree (tenant_id, email);


--
-- Name: idx_wa_instance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wa_instance ON public.workflow_approvals USING btree (workflow_instance_id);


--
-- Name: idx_wd_tenant_mod; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wd_tenant_mod ON public.workflow_definitions USING btree (tenant_id, module_type);


--
-- Name: idx_wi_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wi_status ON public.workflow_instances USING btree (tenant_id, status);


--
-- Name: idx_wi_tenant_ent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wi_tenant_ent ON public.workflow_instances USING btree (tenant_id, entity_type, entity_id);


--
-- Name: uk_exp_claim_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_exp_claim_number ON public.expense_claims USING btree (tenant_id, claim_number);


--
-- Name: announcement_acknowledgments announcement_acknowledgments_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_acknowledgments
    ADD CONSTRAINT announcement_acknowledgments_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.company_announcements(id) ON DELETE CASCADE;


--
-- Name: announcement_acknowledgments announcement_acknowledgments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement_acknowledgments
    ADD CONSTRAINT announcement_acknowledgments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: asset_allocations asset_allocations_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_allocations
    ADD CONSTRAINT asset_allocations_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: asset_allocations asset_allocations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_allocations
    ADD CONSTRAINT asset_allocations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_office_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_office_location_id_fkey FOREIGN KEY (office_location_id) REFERENCES public.office_locations(id) ON DELETE SET NULL;


--
-- Name: attendance_regularizations attendance_regularizations_attendance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations
    ADD CONSTRAINT attendance_regularizations_attendance_id_fkey FOREIGN KEY (attendance_id) REFERENCES public.attendance(id) ON DELETE SET NULL;


--
-- Name: attendance_regularizations attendance_regularizations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations
    ADD CONSTRAINT attendance_regularizations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance_regularizations attendance_regularizations_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations
    ADD CONSTRAINT attendance_regularizations_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_announcements company_announcements_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_announcements
    ADD CONSTRAINT company_announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: company_announcements company_announcements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_announcements
    ADD CONSTRAINT company_announcements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: employee_documents employee_documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_documents employee_documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employee_goals employee_goals_cycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_goals
    ADD CONSTRAINT employee_goals_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE;


--
-- Name: employee_goals employee_goals_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_goals
    ADD CONSTRAINT employee_goals_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_leave_balances employee_leave_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_balances
    ADD CONSTRAINT employee_leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_requests employee_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_requests employee_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT employee_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employee_separations employee_separations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_separations
    ADD CONSTRAINT employee_separations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_separations employee_separations_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_separations
    ADD CONSTRAINT employee_separations_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: refresh_tokens fk1lih5y2npsf8u5o3vhdb9y0os; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: login_history fk20v0mimmdegh2afs39uixlxpm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT fk20v0mimmdegh2afs39uixlxpm FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: departments fk56q3esufky8u69xbmo4n63c4r; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT fk56q3esufky8u69xbmo4n63c4r FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: performance_reviews fk57bxpu5rccy6vvcqolbnbqal0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT fk57bxpu5rccy6vvcqolbnbqal0 FOREIGN KEY (reviewer_id) REFERENCES public.employees(id);


--
-- Name: employees fk69x3vjuy1t5p18a5llb8h2fjx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk69x3vjuy1t5p18a5llb8h2fjx FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: performance_reviews fk75f19q3rvitsw5bl5o3k0lirt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.performance_reviews
    ADD CONSTRAINT fk75f19q3rvitsw5bl5o3k0lirt FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: candidates fk7rt9091ioibhg96nw18g78w87; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fk7rt9091ioibhg96nw18g78w87 FOREIGN KEY (referred_by) REFERENCES public.employees(id);


--
-- Name: notifications fk9y21adhxn0ayjhfocscqox7bh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk9y21adhxn0ayjhfocscqox7bh FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: attendance_regularizations fk_att_reg_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_regularizations
    ADD CONSTRAINT fk_att_reg_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_documents fk_ed_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT fk_ed_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_leave_balances fk_elb_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_balances
    ADD CONSTRAINT fk_elb_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_requests fk_er_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_requests
    ADD CONSTRAINT fk_er_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: expense_claims fk_exp_emp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT fk_exp_emp FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: expense_claims fk_exp_fin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT fk_exp_fin FOREIGN KEY (finance_reviewer_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: expense_claims fk_exp_mgr; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT fk_exp_mgr FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: expense_claims fk_exp_slip; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT fk_exp_slip FOREIGN KEY (payroll_slip_id) REFERENCES public.payroll_slips(id) ON DELETE SET NULL;


--
-- Name: leave_policies fk_lp_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_policies
    ADD CONSTRAINT fk_lp_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: office_locations fk_ol_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.office_locations
    ADD CONSTRAINT fk_ol_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: policy_acknowledgements fk_pa_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT fk_pa_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_approvals fk_wa_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT fk_wa_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_definitions fk_wd_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_definitions
    ADD CONSTRAINT fk_wd_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_instances fk_wi_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT fk_wi_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_steps fk_ws_tenant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT fk_ws_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: attendance fkb48lmkou5j4rvde9sr88bqgjw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fkb48lmkou5j4rvde9sr88bqgjw FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: interview_scorecards fkd1rjgtcf63yap70y0s5810iec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards
    ADD CONSTRAINT fkd1rjgtcf63yap70y0s5810iec FOREIGN KEY (interviewer_id) REFERENCES public.employees(id);


--
-- Name: job_postings fke3uny7fq6xryh69fn229xckaf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT fke3uny7fq6xryh69fn229xckaf FOREIGN KEY (hiring_manager_id) REFERENCES public.employees(id);


--
-- Name: employees fkgy4qe3dnqrm3ktd76sxp7n4c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fkgy4qe3dnqrm3ktd76sxp7n4c2 FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: employees fki4365uo9af35g7jtbc2rteukt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fki4365uo9af35g7jtbc2rteukt FOREIGN KEY (manager_id) REFERENCES public.employees(id);


--
-- Name: job_postings fklf5mdg8kjkvp8cpmvb1u4kypc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT fklf5mdg8kjkvp8cpmvb1u4kypc FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: leave_requests fkm6br6lc65loui2q8s547hqyv7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fkm6br6lc65loui2q8s547hqyv7 FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: candidates fkoe0856gvdr227x6x9f5n8eh4n; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fkoe0856gvdr227x6x9f5n8eh4n FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id);


--
-- Name: payroll_slips fkpoicqcn7c9rfhevvpcmp26lkf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_slips
    ADD CONSTRAINT fkpoicqcn7c9rfhevvpcmp26lkf FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: leave_requests fkrxff2xg1kffbjfh5maxwoqyhw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT fkrxff2xg1kffbjfh5maxwoqyhw FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: flight_risk_evaluations flight_risk_evaluations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight_risk_evaluations
    ADD CONSTRAINT flight_risk_evaluations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: full_and_final_settlements full_and_final_settlements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.full_and_final_settlements
    ADD CONSTRAINT full_and_final_settlements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: full_and_final_settlements full_and_final_settlements_separation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.full_and_final_settlements
    ADD CONSTRAINT full_and_final_settlements_separation_id_fkey FOREIGN KEY (separation_id) REFERENCES public.employee_separations(id) ON DELETE CASCADE;


--
-- Name: interview_scorecards interview_scorecards_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards
    ADD CONSTRAINT interview_scorecards_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: interview_scorecards interview_scorecards_interview_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards
    ADD CONSTRAINT interview_scorecards_interview_session_id_fkey FOREIGN KEY (interview_session_id) REFERENCES public.interview_sessions(id) ON DELETE SET NULL;


--
-- Name: interview_scorecards interview_scorecards_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_scorecards
    ADD CONSTRAINT interview_scorecards_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: interview_sessions interview_sessions_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: interview_sessions interview_sessions_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: interview_sessions interview_sessions_job_posting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_job_posting_id_fkey FOREIGN KEY (job_posting_id) REFERENCES public.job_postings(id) ON DELETE SET NULL;


--
-- Name: job_openings job_openings_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_openings
    ADD CONSTRAINT job_openings_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: policy_acknowledgements policy_acknowledgements_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.employee_documents(id) ON DELETE CASCADE;


--
-- Name: policy_acknowledgements policy_acknowledgements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.policy_acknowledgements
    ADD CONSTRAINT policy_acknowledgements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: roster_assignments roster_assignments_assigned_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_assigned_by_user_id_fkey FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: roster_assignments roster_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: roster_assignments roster_assignments_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roster_assignments
    ADD CONSTRAINT roster_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE RESTRICT;


--
-- Name: separation_clearances separation_clearances_separation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.separation_clearances
    ADD CONSTRAINT separation_clearances_separation_id_fkey FOREIGN KEY (separation_id) REFERENCES public.employee_separations(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_requester_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_requester_employee_id_fkey FOREIGN KEY (requester_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_requester_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_requester_roster_id_fkey FOREIGN KEY (requester_roster_id) REFERENCES public.roster_assignments(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_reviewed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_reviewed_by_user_id_fkey FOREIGN KEY (reviewed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: shift_swap_requests shift_swap_requests_target_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_target_employee_id_fkey FOREIGN KEY (target_employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: shift_swap_requests shift_swap_requests_target_roster_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_swap_requests
    ADD CONSTRAINT shift_swap_requests_target_roster_id_fkey FOREIGN KEY (target_roster_id) REFERENCES public.roster_assignments(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: tax_declarations tax_declarations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_declarations
    ADD CONSTRAINT tax_declarations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: tenant_settings tenant_settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_subscriptions tenant_subscriptions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: ticket_comments ticket_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: ticket_comments ticket_comments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_comments
    ADD CONSTRAINT ticket_comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_approvals workflow_approvals_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_approvals workflow_approvals_workflow_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_workflow_instance_id_fkey FOREIGN KEY (workflow_instance_id) REFERENCES public.workflow_instances(id) ON DELETE CASCADE;


--
-- Name: workflow_instances workflow_instances_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_instances workflow_instances_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES public.workflow_definitions(id) ON DELETE RESTRICT;


--
-- Name: workflow_steps workflow_steps_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES public.workflow_definitions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2CsaETyoQyGVFI479KwaIV9zNF2RzaC3XxqQ27c5lMX4HkBT9OrLJd8pYWfD173

