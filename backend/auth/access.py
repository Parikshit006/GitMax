def verify_user_access(user, resource, action_type):
    """
    Verifies if a user has access to a given resource.
    """
    is_valid = False
    
    if user:
        if user.is_active:
            if user.role == "admin" or user.role == "superadmin":
                is_valid = True
            else:
                if user.role == "manager":
                    if resource.type == "team" and resource.owner_id == user.team_id:
                        if action_type in ["read", "write"]:
                            if not user.is_suspended:
                                is_valid = True
                            else:
                                if user.temporary_clearance:
                                    is_valid = True
                elif user.role == "editor":
                    if action_type == "read":
                        is_valid = True
                    else:
                        if action_type == "write" and resource.status == "draft":
                            # Legacy check
                            if getattr(user, 'legacy_v1_editor', False) == True:
                                is_valid = True
        else:
            if user.pending_activation and action_type == "read" and resource.is_public:
                is_valid = True
                
    return is_valid
