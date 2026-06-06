import re

def fix_use_crm_data(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace `const name = async (...) => { ... }` with `const name = useCallback(async (...) => { ... }, []);`
    # We will do this by looking for `const methodName = async` and then finding its matching closing brace.
    
    methods_to_wrap = [
        'addCustomer', 'updateCustomer', 'deleteCustomer', 'deleteAllCustomers', 'bulkAddCustomers',
        'addProduct', 'updateProduct', 'deleteProduct', 'bulkAddProducts', 'addSale', 'addRemark',
        'addPayment', 'addBill', 'addTask', 'toggleTaskComplete', 'addInvoice', 'addPaymentRecord',
        'updateSettings', 'updateCustomerTags', 'createSnapshot'
    ]
    
    for method in methods_to_wrap:
        # Simple regex for finding the start of the function
        pattern = r"(const\s+" + method + r"\s*=\s*)(async\s*\([^{]+=>\s*\{)"
        
        match = re.search(pattern, content)
        if match:
            start_index = match.end()
            # Find the matching closing brace
            open_braces = 1
            i = start_index
            while i < len(content) and open_braces > 0:
                if content[i] == '{':
                    open_braces += 1
                elif content[i] == '}':
                    open_braces -= 1
                i += 1
            
            # The function ends at i
            original_func = content[match.start(2):i]
            replacement = f"useCallback({original_func}, [])"
            
            content = content[:match.start(2)] + replacement + content[i:]

    # Now let's fix the return statement to wrap it in useMemo
    return_pattern = r"(return\s+)(\{\s+loading,\s+isAnalyticsLoading,[^;]+;\n\s+\};)"
    match = re.search(return_pattern, content)
    if match:
        obj_content = match.group(2)
        # We need to construct the dependency array for useMemo.
        deps = ["loading", "isAnalyticsLoading", "customers", "products", "tasks", "remarks", "sales", "invoices", "allPayments", "userSettings", "historicalSnapshots", "filteredCustomers", "searchTerm", "filters"]
        deps_str = ", ".join(deps)
        
        # updateCustomerFlag is defined inline in the return object, we should wrap it in useCallback as well
        # But actually, it's safer to just define it outside the return.
        
        # Let's just fix updateCustomerFlag
        inline_flag = r"(updateCustomerFlag:\s*)(async\s*\([^{]+=>\s*\{.*?\n\s+\},)"
        # We can't easily parse that with simple regex, but wait, the useMemo will memoize the whole object.
        # So we just do:
        replacement_return = f"return useMemo(() => {obj_content.rstrip(';')}, [{deps_str}]);"
        content = content[:match.start()] + replacement_return + content[match.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_use_crm_data(r'c:\Users\MIR MEHRAJ\OneDrive\Desktop\My CRM\src\hooks\useCrmData.ts')
