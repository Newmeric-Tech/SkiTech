ROLE_PERMISSIONS = {

    "Super Admin": [
        "manage_all",
        "view_dashboard",
        "manage_property",
        "manage_staff",
        # SOP permissions
        "view_sop",
        "create_sop",
        "update_sop",
        "delete_sop",
        # Inventory permissions
        "view_inventory",
        "manage_inventory",
        # Vendor permissions
        "view_vendor",
        "create_vendor",
        "update_vendor",
        "delete_vendor",
        # Owner permissions
        "view_owner",
        "manage_owner",
        # Department permissions
        "view_department",
        "create_department",
        "update_department",
        "delete_department",
    ],

    "Tenant Admin": [
        "view_dashboard",
        "manage_property",
        "manage_staff",
        # SOP permissions
        "view_sop",
        "create_sop",
        "update_sop",
        "delete_sop",
        # Inventory permissions
        "view_inventory",
        "manage_inventory",
        # Vendor permissions
        "view_vendor",
        "create_vendor",
        "update_vendor",
        "delete_vendor",
        # Owner permissions
        "view_owner",
        "manage_owner",
        # Department permissions
        "view_department",
        "create_department",
        "update_department",
        "delete_department",
    ],

    "Manager": [
        "view_dashboard",
        "manage_staff",
        # SOP permissions - Managers can create and view SOPs
        "view_sop",
        "create_sop",
        "update_sop",
        # Inventory permissions - Managers can view inventory only
        "view_inventory",
        # Vendor permissions - Managers can view vendors only
        "view_vendor",
        # Owner permissions - Managers cannot access owner details
        # Department permissions - Managers can manage departments
        "view_department",
        "create_department",
        "update_department",
    ],

    "Staff": [
        "view_dashboard",
        # SOP permissions - Staff can only view SOPs
        "view_sop",
        # Inventory permissions - Staff can only view inventory
        "view_inventory",
        # Vendor permissions - Staff cannot access vendors
        # Owner permissions - Staff cannot access owner details
        # Department permissions - Staff can only view departments
        "view_department",
    ]
}