# -*- coding: utf-8 -*-
# Copyright (c) 2019, Frappé and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class PressureTestPrintFormat(Document):

	def on_submit(self):
		self.manage_default_ptpf()

	def on_cancel(self):
		frappe.db.set(self, "is_default", 0)
		self.manage_default_ptpf()

	def on_update_after_submit(self):
		self.manage_default_ptpf()

	def manage_default_ptpf(self):
		""" Uncheck others if current one is selected as default,
			update default bom in item master
		"""
		if self.is_default:
			from frappe.model.utils import set_default
			set_default(self, "item")
			item = frappe.get_doc("Item", self.item)
			if item.pch_default_ptpf != self.name:
				frappe.db.set_value('Item', self.item, 'pch_default_ptpf', self.name)
		else:
			frappe.db.set(self, "is_default", 0)
			item = frappe.get_doc("Item", self.item)
			if item.pch_default_ptpf == self.name:
				frappe.db.set_value('Item', self.item, 'pch_default_ptpf', None)

@frappe.whitelist()
def fetch_quality_inspection_readings(name):
	records = frappe.get_doc("Quality Inspection Template", name)
	return records.item_quality_inspection_parameter
