// Copyright (c) 2019, Frappé and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pressure Test Print Format', {
	refresh: function(frm) {

	}
});

frappe.ui.form.on("Pressure Test Print Format", "reports_based_on", function(frm, cdt, cdn) {
    console.log("Pressure Test Print Format...");
    var d = locals[cdt][cdn];
    var reports_based_on = d.reports_based_on;
    if (reports_based_on == "Different Readings") {
        cur_frm.set_df_property("number_of_readings_to_be_considered", "hidden", false);
        refresh_field("number_of_readings_to_be_considered");
    } else if (reports_based_on == "Separate Reports") {
        cur_frm.set_df_property("number_of_readings_to_be_considered", "hidden", true);
        refresh_field("number_of_readings_to_be_considered");
    }
});




frappe.ui.form.on("Quality Inspection Readings", {
    reading_type: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        console.log("reading_type::" + row.reading_type);
        if (row.reading_type == "Text") {
            var dialog = new frappe.ui.Dialog({
                title: __("Select Reporting Value"),
                fields: [{
                    "fieldtype": "Select",
                    "label": __("Reporting Value"),
                    "fieldname": "reporting_value",
		    "reqd": 1,
                    "options": ['Report Acceptance Criteria', 'Reading1']
                }],
                primary_action: function() {
                    dialog.hide();
		   var readings = dialog.get_values();
		   var reporting_value = readings.reporting_value;
            	   row.report_value = reporting_value;
		   refresh_field("report_value");
        	   refresh_field("readings");
                }
            }); //end of dialog box...
            dialog.show();

        }else if (row.reading_type == "Float"){
		var dialog = new frappe.ui.Dialog({
                title: __("Select Reporting Value"),
                fields: [{
                    "fieldtype": "Select",
                    "label": __("Reporting Value"),
                    "fieldname": "reporting_value",
		    "reqd": 1,
                    "options": ['Max', 'Min', 'Avg']
                }],
                primary_action: function() {
                    dialog.hide();
		   var readings = dialog.get_values();
		   var reporting_value = readings.reporting_value;
            	   row.report_value = reporting_value;
		   refresh_field("report_value");
        	   refresh_field("readings");
                }
            }); //end of dialog box...
            dialog.show();
	}

    }//end of reading type
});



frappe.ui.form.on("Pressure Test Print Format", "refresh", function(frm, cdt, cdn) {
    console.log("Entered------");
    var items_list = fetch_item_quality_inspection_parameters();
    console.log("items_list------" + items_list);

    cur_frm.set_query("specification", "readings", function(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        var index = d.idx;
	var selected_parameters_list = [];
	var parameters_list = [];

	$.each(cur_frm.doc.readings || [], function(i, readings) {
        	var specification = readings.specification;
		console.log("parameter-----"+ specification);
		if (readings.specification != null && readings.specification !="" && readings.specification != undefined){
        		selected_parameters_list.push(readings.specification);
		}
        }) //end of each loop...

	for (var i = 0; i < items_list.length; i++) {
        	if (!selected_parameters_list.includes(items_list[i])) {
            		parameters_list.push(items_list[i]);
        	}
   	 }
	console.log("parameters_list------" + parameters_list);

	return {
            "filters": [
               ["Item Quality Inspection Parameters", "name", "in", parameters_list]
            ]
         }
         refresh_field("specification");
         refresh_field("readings");

    });

});


frappe.ui.form.on("Pressure Test Print Format", "quality_inspection_template", function(frm, cdt, cdn) {
    var cocpf_id = cur_frm.doc.quality_inspection_template;
    //var readings = fetch_cocpf_readings(cocpf_id);
    frappe.call({
        method: "jiqm_test.jiqm_test.doctype.pressure_test_print_format.pressure_test_print_format.fetch_quality_inspection_readings",
        args: {
            "name": cocpf_id
        },
        async: false,
        callback: function(r) {
            if (r.message) {
                console.log("readings------------::" + JSON.stringify(r.message));
		cur_frm.clear_table("readings");
		var readings = r.message;
		for (var i=0;i<readings.length;i++){
			console.log("specification------------::" + readings[i]['specification']);
			var child = cur_frm.add_child("readings");
			frappe.model.set_value(child.doctype, child.name, "specification", readings[i]['specification']);
		}//end of for loop...
		 refresh_field("readings");
            }
        } //end of callback fun..
    }) //end of frappe call..
});


function fetch_item_quality_inspection_parameters() {
    var parameters_list = [];
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: "Item Quality Inspection Parameters"
        },
        fieldname: ["name"],
        async: false,
        callback: function(r) {
            if (r.message) {
                //console.log("Items List-----"+ JSON.stringify(r.message));
                for (var i = 0; i < r.message.length; i++) {
                    //console.log("Name:"+r.message[i]['name']);
                    var parameter = r.message[i]['name'];
                    parameters_list.push(parameter);
                }
            }

        }
    });
    return parameters_list
}
