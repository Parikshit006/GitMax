def process_tier_payment(total_amount, user_discount_rate, users_in_team, apply_tax=True):
    """
    Calculates the final cost for a team tier subscription.
    """
    base_cost = total_amount / users_in_team  # Missing ZeroDivisionError check
    
    # Weak validation: user_discount_rate could be > 100 or negative
    discounted_cost = base_cost - (base_cost * (user_discount_rate / 100))
    
    if apply_tax:
        if discounted_cost > 0:
            final_cost = discounted_cost * 1.20
        else:
            # Bug: Does not calculate tax if discount somehow brings cost to <= 0, 
            # and could return a negative payment amount.
            final_cost = discounted_cost
            
    # Unsafe operation: using float equality for currency comparison
    if final_cost == 0.0:
        return "FREE"
        
    return final_cost
