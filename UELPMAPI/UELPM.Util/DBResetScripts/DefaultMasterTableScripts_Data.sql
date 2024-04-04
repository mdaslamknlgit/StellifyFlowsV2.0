
SET IDENTITY_INSERT [dbo].[AttachmentTypes] ON 

GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (1, N'PurchaseOrder')
GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (2, N'Ticket')
GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (3, N'PurchaseOrderRequest')
GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (4, N'Invoice')
GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (5, N'PORQuotation')
GO
INSERT [dbo].[AttachmentTypes] ([AttachmentTypeid], [AttachmentText]) VALUES (6, N'GoodsReceivedNotes')
GO
SET IDENTITY_INSERT [dbo].[AttachmentTypes] OFF
GO
INSERT [dbo].[BillingFrequency] ([FrequencyId], [FrequencyText]) VALUES (1, N'Monthly')
GO
INSERT [dbo].[BillingFrequency] ([FrequencyId], [FrequencyText]) VALUES (2, N'Quarterly')
GO
INSERT [dbo].[BillingFrequency] ([FrequencyId], [FrequencyText]) VALUES (3, N'Half Yearly')
GO
INSERT [dbo].[BillingFrequency] ([FrequencyId], [FrequencyText]) VALUES (4, N'Yearly')
GO
SET IDENTITY_INSERT [dbo].[CostofService] ON 

GO
INSERT [dbo].[CostofService] ([CostofServiceId], [CostofService], [IsDeleted]) VALUES (1, N'Billable', 0)
GO
INSERT [dbo].[CostofService] ([CostofServiceId], [CostofService], [IsDeleted]) VALUES (2, N'Non-Billable', 0)
GO
INSERT [dbo].[CostofService] ([CostofServiceId], [CostofService], [IsDeleted]) VALUES (3, N'Operating Expenses', 0)
GO
INSERT [dbo].[CostofService] ([CostofServiceId], [CostofService], [IsDeleted]) VALUES (4, N'Upgrading Works', 0)
GO
SET IDENTITY_INSERT [dbo].[CostofService] OFF
GO
SET IDENTITY_INSERT [dbo].[Countries] ON 

GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (349, N'VU', N'Vanuatu')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (350, N'VN', N'Vietnam')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (351, N'EC', N'Ecuador')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (352, N'VI', N'Virgin Islands (USA)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (353, N'DZ', N'Algeria')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (354, N'VG', N'British Virgin Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (355, N'VE', N'VenezUEL_Test1a')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (356, N'DM', N'Dominica')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (357, N'VC', N'St Vincent and Grenadines')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (358, N'DO', N'Dominican Republic')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (359, N'VA', N'Vatican City')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (360, N'DE', N'Germany')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (361, N'UZ', N'Uzbekistan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (362, N'UY', N'Uruguay')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (363, N'DK', N'Denmark')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (364, N'DJ', N'Djibouti')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (365, N'US', N'United States')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (366, N'UM', N'US Minor Outer Isles')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (367, N'UG', N'Uganda')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (368, N'UA', N'Ukraine')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (369, N'ET', N'Ethiopia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (370, N'ES', N'Spain')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (371, N'ER', N'Eritrea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (372, N'EH', N'Western Sahara')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (373, N'EG', N'Egypt')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (374, N'TZ', N'Tanzania')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (375, N'EE', N'Estonia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (376, N'TT', N'Trinidad and Tobago')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (377, N'TW', N'Taiwan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (378, N'TV', N'Tuvalu')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (379, N'GD', N'Grenada')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (380, N'GE', N'Georgia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (381, N'GF', N'French Guiana')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (382, N'GA', N'Gabon')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (383, N'GB', N'United Kingdom')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (384, N'FR', N'France')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (385, N'FO', N'Faroe Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (386, N'FK', N'Falklands Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (387, N'FJ', N'Fiji')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (388, N'FM', N'Micronesia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (389, N'FI', N'Finland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (390, N'WS', N'Samoa')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (391, N'GY', N'Guyana')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (392, N'GW', N'Guinea-Bissau')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (393, N'GU', N'Guam')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (394, N'GT', N'Guatemala')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (395, N'GS', N'South Georgia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (396, N'GR', N'Greece')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (397, N'GQ', N'Equatorial Guinea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (398, N'WF', N'Wallis and Futuna Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (399, N'GP', N'Guadeloupe')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (400, N'GN', N'Guinea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (401, N'GM', N'Gambia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (402, N'GL', N'Greenland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (403, N'GI', N'Gibraltar')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (404, N'GH', N'Ghana')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (405, N'GG', N'Guernsey')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (406, N'RE', N'Reunion')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (407, N'RO', N'Romania')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (408, N'AT', N'Austria')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (409, N'AS', N'American Samoa')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (410, N'AR', N'Argentina')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (411, N'AQ', N'Antarctica')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (412, N'AX', N'Aland Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (413, N'AW', N'Aruba')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (414, N'QA', N'Qatar')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (415, N'AU', N'Australia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (416, N'AZ', N'Azerbaijan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (417, N'BA', N'Bosnia Herzegovina')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (418, N'PT', N'Portugal')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (419, N'AD', N'Andorra')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (420, N'PW', N'Palau')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (421, N'AG', N'Antigua')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (422, N'AE', N'United Arab Emirates')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (423, N'PR', N'Puerto Rico')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (424, N'AF', N'Afghanistan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (425, N'PS', N'Palestine')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (426, N'AL', N'Albania')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (427, N'AI', N'Anguilla')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (428, N'AO', N'Angola')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (429, N'PY', N'Paraguay')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (430, N'AM', N'Armenia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (431, N'AN', N'Netherlands Antilles')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (432, N'TG', N'Togo')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (433, N'BW', N'Botswana')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (434, N'TF', N'French Southern Territory')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (435, N'BV', N'Bouvet Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (436, N'BY', N'Belarus')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (437, N'TD', N'Chad')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (438, N'TK', N'Tokelau')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (439, N'BS', N'Bahamas')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (440, N'TJ', N'Tadjikistan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (441, N'BR', N'Brazil')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (442, N'TH', N'Thailand')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (443, N'BT', N'Bhutan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (444, N'TO', N'Tonga')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (445, N'TN', N'Tunisia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (446, N'TM', N'Turkmenistan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (447, N'TL', N'Timor-Leste')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (448, N'CA', N'Canada')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (449, N'TR', N'Turkey')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (450, N'BZ', N'Belize')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (451, N'BF', N'Burkina Faso')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (452, N'SV', N'El Salvador')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (453, N'BG', N'Bulgaria')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (454, N'SS', N'South Sudan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (455, N'BH', N'Bahrain')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (456, N'ST', N'Sao Tome and Principe')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (457, N'BI', N'Burundi')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (458, N'SY', N'Syria')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (459, N'BB', N'Barbados')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (460, N'SZ', N'Swaziland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (461, N'BD', N'Bangladesh')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (462, N'BE', N'Belgium')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (463, N'BN', N'Brunei Darussalam')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (464, N'BO', N'Bolivia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (465, N'BJ', N'Benin')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (466, N'TC', N'Turks and Caicos Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (467, N'BL', N'Saint Barthelemy')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (468, N'BM', N'Bermuda')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (469, N'SD', N'Sudan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (470, N'CZ', N'Czech Republic')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (471, N'SC', N'Seychelles')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (472, N'CY', N'Cyprus')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (473, N'CX', N'Christmas Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (474, N'SE', N'Sweden')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (475, N'SH', N'St Helena')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (476, N'CV', N'Cape Verde')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (477, N'SG', N'Singapore')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (478, N'CU', N'Cuba')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (479, N'SJ', N'Svalbard and Jan Mayen')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (480, N'SI', N'Slovenia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (481, N'SL', N'Sierra Leone')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (482, N'SK', N'Slovakia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (483, N'SN', N'Senegal')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (484, N'SM', N'San Marino (Republic of)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (485, N'SO', N'Somalia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (486, N'SR', N'Suriname')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (487, N'CI', N'Ivory Coast')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (488, N'RS', N'Serbia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (489, N'CG', N'Congo')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (490, N'CH', N'Switzerland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (491, N'RU', N'Russia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (492, N'RW', N'Rwanda')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (493, N'CF', N'Central African Republic')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (494, N'CC', N'Cocos Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (495, N'CD', N'Zaire')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (496, N'CR', N'Costa Rica')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (497, N'CO', N'Colombia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (498, N'CM', N'Cameroon')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (499, N'CN', N'China')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (500, N'SA', N'Saudi Arabia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (501, N'CK', N'Cook Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (502, N'SB', N'Solomon Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (503, N'CL', N'Chile')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (504, N'LV', N'Latvia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (505, N'LU', N'Luxembourg')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (506, N'LT', N'Lithuania')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (507, N'LY', N'Libya')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (508, N'LS', N'Lesotho')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (509, N'LR', N'Liberia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (510, N'MG', N'Madagascar')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (511, N'MH', N'Marshall Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (512, N'ME', N'Montenegro')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (513, N'MF', N'Saint Martin (F)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (514, N'MK', N'Macedonia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (515, N'ML', N'Mali')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (516, N'MC', N'Monaco')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (517, N'MD', N'Moldova')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (518, N'MA', N'Morocco')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (519, N'MV', N'Maldives')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (520, N'MU', N'Mauritius')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (521, N'MX', N'Mexico')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (522, N'MW', N'Malawi')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (523, N'MZ', N'Mozambique')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (524, N'MY', N'Malaysia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (525, N'MN', N'Mongolia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (526, N'MM', N'Myanmar')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (527, N'MP', N'Northern Mariana Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (528, N'MO', N'Macau')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (529, N'MR', N'Mauritania')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (530, N'MQ', N'Martinique')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (531, N'MT', N'Malta')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (532, N'MS', N'Montserrat')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (533, N'NF', N'Norfolk Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (534, N'NG', N'Nigeria')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (535, N'NI', N'Nicaragua')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (536, N'NL', N'Netherlands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (537, N'NA', N'Namibia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (538, N'NC', N'New Caledonia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (539, N'NE', N'Niger')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (540, N'NZ', N'New Zealand')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (541, N'NU', N'Niue')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (542, N'NS', N'North Cyprus')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (543, N'NR', N'Nauru')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (544, N'NP', N'Nepal')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (545, N'NO', N'Norway')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (546, N'OM', N'Oman')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (547, N'PL', N'Poland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (548, N'PM', N'St Pierre and MiqUEL_Test1on')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (549, N'PN', N'Pitcairn')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (550, N'PH', N'Philippines')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (551, N'PK', N'Pakistan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (552, N'PE', N'Peru')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (553, N'PF', N'French Polynesia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (554, N'PG', N'Papua New Guinea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (555, N'PA', N'Panama')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (556, N'HK', N'Hong Kong')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (557, N'ZA', N'South Africa')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (558, N'HN', N'Honduras')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (559, N'HM', N'Heard and McDonald Island')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (560, N'HR', N'Croatia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (561, N'HT', N'Haiti')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (562, N'HU', N'Hungary')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (563, N'ZM', N'Zambia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (564, N'ZW', N'Zimbabwe')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (565, N'ID', N'Indonesia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (566, N'IE', N'Ireland(Republic of)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (567, N'IL', N'Israel')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (568, N'IM', N'Isle Of Man')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (569, N'IN', N'India')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (570, N'IO', N'British Indian Ocean Territory')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (571, N'IQ', N'Iraq')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (572, N'IR', N'Iran')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (573, N'YE', N'Yemen Republic')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (574, N'IS', N'Iceland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (575, N'IT', N'Italy')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (576, N'JE', N'Jersey')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (577, N'YT', N'Mayotte')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (578, N'JP', N'Japan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (579, N'JO', N'Jordan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (580, N'JM', N'Jamaica')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (581, N'KI', N'Kiribati')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (582, N'KH', N'Cambodia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (583, N'KG', N'Kyrgyzstan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (584, N'KE', N'Kenya')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (585, N'KP', N'North Korea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (586, N'KR', N'South Korea')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (587, N'KM', N'Comoros')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (588, N'KN', N'St Kitts and Nevis')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (589, N'KW', N'Kuwait')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (590, N'KY', N'Cayman Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (591, N'KZ', N'Kazakhstan')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (592, N'KV', N'Kosovo')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (593, N'LA', N'Laos')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (594, N'LC', N'St Lucia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (595, N'LB', N'Lebanon')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (596, N'LI', N'Liechtenstein')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (597, N'LK', N'Sri Lanka')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (598, N'137', N'ANTIGUA AND BARBUDA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (599, N'305', N'BONAIRE, SINT EUSTATIUS AND SABA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (600, N'59', N'BOSNIA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (601, N'166', N'BRUNEI')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (602, N'101', N'CARIBBEAN')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (603, N'53', N'COCOS (KEELING) ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (604, N'210', N'CONGO.REPUBLIC OF')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (605, N'435', N'CRIMEA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (606, N'325', N'CURACAO')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (607, N'209', N'DEMOCRATIC REPUBLIC OF CONGO')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (608, N'150', N'FALKLAND ISLANDS(MALVINAS)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (609, N'182', N'FRENCH SOUTHERN TERRITORIES')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (610, N'141', N'GRENADA /CARRICOU')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (611, N'33', N'HAWAII')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (612, N'345', N'HEARD ISLAND AND MCDONALD ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (613, N'22', N'MYANMAR-BURMA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (614, N'43', N'NORTHERN MARIANA ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (615, N'18', N'PALESTINIAN TERRITORY')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (616, N'45', N'PITCAIRN ISLAND')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (617, N'71', N'REPUBLIC OF IRELAND')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (618, N'180', N'REPUBLIC OF PALAU')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (619, N'239', N'SAINT HELENA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (620, N'144', N'SAINT KITTS AND NEVIS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (621, N'385', N'SAINT MARTIN (FRENCH PART)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (622, N'104', N'SAINT PIERRE AND MIQUEL_Test1ON')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (623, N'147', N'SAINT VINCENT AND THE GRENADINES')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (624, N'95', N'SAN MARINO')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (625, N'395', N'SINT MAARTEN (DUTCH PART)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (626, N'405', N'SOUTH GEORGIA AND THE SOUTH SANDWICH ISL')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (627, N'161', N'TAJIKISTAN')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (628, N'252', N'TASMANIA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (629, N'186', N'TIMOR LESTE')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (630, N'47', N'TOKELAU ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (631, N'121', N'TURKS / CAICOS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (632, N'132', N'U.S. VIRGIN ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (633, N'425', N'UNITED STATES MINOR OUTLYING ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (634, N'102', N'UNITED STATES OF AMERICA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (635, N'94', N'VATICAN CITY STATE (HOLY SEE)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (636, N'148', N'VIRGIN ISLANDS (BRITISH)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (637, N'51', N'WALLIS AND FUTUNA ISLANDS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (638, N'265', N'WEST BANK')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (639, N'15', N'YEMEN')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (640, N'106', N'zzzzz DO NOT USE ANTIGUA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (641, N'8857', N'Hong Kong (China)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (642, N'8911', N'Saint Kitts & Nevis')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (643, N'8912', N'Saint Lucia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (644, N'8913', N'Saint Vincent And The Grenadin')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (645, N'8937', N'Turks And Caicos Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (646, N'8939', N'UAE')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (647, N'8947', N'USA')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (648, N'52337', N'UK - England')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (649, N'52338', N'Ireland, Republic Of')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (650, N'52339', N'UK - Northern Ireland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (651, N'52340', N'UK - Scotland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (652, N'52341', N'UK - Wales')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (653, N'BA', N'Bosnia - Herzegovina')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (654, N'CD', N'Congo, Democratic Republic of the')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (655, N'GB', N'England')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (656, N'FM', N'Federated States of Micronesia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (657, N'FJ', N'Fiji Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (658, N'GW', N'Guinea Bissau')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (659, N'IE', N'Ireland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (660, N'MP', N'Mariana Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (661, N'GB', N'Northern Ireland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (662, N'RU', N'Russian Federation')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (663, N'MF', N'Saint Martin (MF)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (664, N'GB', N'Scotland')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (665, N'SX', N'Sint Maarten SX')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (666, N'VI', N'US Virgin Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (667, N'GB', N'Wales')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (679, N'AG', N'Antigua & Barbuda')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (680, N'BA', N'Bosnia & Herzegovina')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (681, N'BK', N'Caribbean Netherlands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (682, N'CD', N'Congo (DRC)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (683, N'CG', N'Congo - Brazzaville')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (684, N'C0', N'Curaçao')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (685, N'TP', N'East Timor')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (686, N'FK', N'Falkland Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (687, N'HM', N'Heard & McDonald Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (688, N'MK', N'Macedonia (FYROM)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (689, N'MM', N'Myanmar (Burma)')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (690, N'NY', N'Northern Cyprus')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (691, N'RE', N'Réunion')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (692, N'ST', N'São Tomé & Príncipe')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (693, N'SF', N'Sint Maarten')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (694, N'GS', N'South Georgia & South Sandwich Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (695, N'BL', N'St. Barthélemy')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (696, N'SH', N'St. Helena')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (697, N'KN', N'St. Kitts & Nevis')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (698, N'LC', N'St. Lucia')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (699, N'PM', N'St. Pierre & MiqUEL_Test1on')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (700, N'VC', N'St. Vincent & Grenadines')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (701, N'SJ', N'Svalbard & Jan Mayen')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (702, N'SY', N'Syria *BLOCKED SANCTIONS')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (703, N'TT', N'Trinidad & Tobago')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (704, N'UM', N'U.S. Outlying Islands')
GO
INSERT [dbo].[Countries] ([Id], [Code], [Name]) VALUES (705, N'WF', N'Wallis & Futuna')
GO
SET IDENTITY_INSERT [dbo].[Countries] OFF
GO
SET IDENTITY_INSERT [dbo].[Currencies] ON 

GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1049, N'AUD', N'Australian Dollars', 0, N'$')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1050, N'HKD', N'Hong Kong Dollars', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1051, N'IDR', N'Indonesian Rupiahs', 0, N'Rp')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1052, N'MYR', N'Malaysian Ringgit', 0, N'RM')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1053, N'SGD', N'Singapore Dollars', 1, N'S$')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1054, N'THB', N'Thai Baht', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1055, N'USD', N'US Dollars', 1, N'$')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1056, N'BHD', N'Bahraini Dinars', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1057, N'CAD', N'Canadian Dollars', 0, N'$')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1058, N'AED', N'United Arab Emirates Dirhams', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1059, N'QAR', N'Qatari Riyals', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1060, N'SAR', N'Saudi Arabian Riyals', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1061, N'SEK', N'Sweden Kronor', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1062, N'ZAR', N'South African Rand', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1063, N'NOK', N'Norwegian Kroner', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1064, N'CNY', N'Chinese Yuan', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1065, N'NZD', N'New Zealand Dollars', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1066, N'MYR', N'Malaysian Ringgits', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1067, N'CHF', N'Swiss Francs', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1068, N'DKK', N'Denmark Kroner', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1069, N'EGP', N'Egyptian Pounds', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1070, N'EUR', N'Euro', 0, N'€')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1071, N'GBP', N'UK Pounds Sterling', 0, N'£')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1072, N'JOD', N'Jordanian Dinars', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1073, N'JPY', N'Japanese Yen', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1074, N'PLN', N'Polish Zloty', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1075, N'AED', N'Utd. Arab Emir. Dirham', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1076, N'AFA', N'AFGHANI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1077, N'ALL', N'LEK', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1078, N'AMD', N'ARMENIAN DRAM', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1079, N'ANG', N'ANTIL. GUILDER', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1080, N'AOR', N'KWANZA REAJUST.', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1081, N'ARS', N'ARGENTINE PESO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1082, N'ATS', N'CHELIN AUSTRIACO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1083, N'AUD', N'Australian Dollar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1084, N'AWG', N'ARUBAN GUILDER', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1085, N'AZM', N'AZERB. MANAT', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1086, N'AZN', N'Azerbaijan Manat', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1087, N'BAD', N'DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1088, N'BAM', N'Bosnia and Herzegovina Convertible Mark', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1089, N'BBD', N'BARBADOS DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1090, N'BDT', N'TAKA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1091, N'BGN', N'Bulgarian Lev', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1092, N'BHD', N'Bahraini Dinar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1093, N'BIF', N'BURUNDI FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1094, N'BMD', N'BERMUDN. DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1095, N'BND', N'Brunei Dollar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1096, N'BOB', N'BOLIVIANO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1097, N'BRL', N'Brazilian Real', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1098, N'BSD', N'BAHAMIAN DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1099, N'BTN', N'NGULTRUM', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1100, N'BWP', N'Botswanan PULA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1101, N'BYB', N'BELARUS RUBLE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1102, N'BYR', N'Belarusian Ruble', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1103, N'BZD', N'BELIZE DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1104, N'CAD', N'Canadian Dollar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1105, N'CHF', N'Swiss Franc', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1106, N'CLP', N'CHILEAN PESO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1107, N'CNY', N'Chinese Yuan Renminbi', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1108, N'COP', N'COLOMBIAN PESO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1109, N'CRC', N'COSTA R. COLON', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1110, N'CUP', N'CUBAN PESO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1111, N'CVE', N'CAPE V. ESCUDO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1112, N'CZK', N'Czech Koruna', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1113, N'DJF', N'DJIBOUTI FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1114, N'DKK', N'Danish Krone', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1115, N'DOP', N'Dominican Peso', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1116, N'DZD', N'ALGERIAN DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1117, N'ECS', N'ECUADORIAN SUCRE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1118, N'EGP', N'Egyptian Pound', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1119, N'ETB', N'ETHIOPIAN BIRR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1120, N'FJD', N'FIJI DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1121, N'FKP', N'FLKND. IS.POUND', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1122, N'GBP', N'United Kingdom Pound', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1123, N'GEL', N'GEORGIAN LARI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1124, N'GHC', N'GHANAIAN CEDI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1125, N'GIP', N'GIBRALTAR POUND', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1126, N'GMD', N'GAMBIAN DALASI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1127, N'GNF', N'GUINEA FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1128, N'GTQ', N'QUETZAL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1129, N'HKD', N'Hong Kong Dollar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1130, N'HNL', N'HONDURAN LEMPIRA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1131, N'HRK', N'CROATIAN KUNA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1132, N'HTG', N'HAITIAN GOURDE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1133, N'HUF', N'Hungarian Forint', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1134, N'IDR', N'Indonesian Rupiah', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1135, N'ILS', N'ISRAEL NEW SHEKEL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1136, N'INR', N'Indian Rupee', 0, N'₹')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1137, N'IQD', N'IRAQI DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1138, N'IRR', N'IRANIAN RIAL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1139, N'ISK', N'Iceland Krona', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1140, N'JMD', N'JAMAICAN DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1141, N'JOD', N'Jordanian Dinar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1142, N'KES', N'KENYEN SHILLING', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1143, N'KGS', N'Kyrgyzstan SOM', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1144, N'KHR', N'CAMBODIAN RIEL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1145, N'KMF', N'COMORO FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1146, N'KPW', N'NTH. KOREAN WON', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1147, N'KRW', N'STH. KOREAN WON', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1148, N'KWD', N'Kuwaiti Dinar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1149, N'KYD', N'Cayman Islands DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1150, N'KZT', N'Kazakhstani TENGE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1151, N'LAK', N'LAOTIAN KIP', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1152, N'LBP', N'LEBANESE POUND', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1153, N'LKR', N'SRI LANKA RUPEE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1154, N'LRD', N'LIBERIAN DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1155, N'LSL', N'Basotho LOTI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1156, N'LTL', N'Lithuanian Litas', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1157, N'LVL', N'Latvian Lats', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1158, N'LYD', N'LIBYAN DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1159, N'MAD', N'Moroccan Dirham', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1160, N'MDL', N'MOLDOVAN LEU', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1161, N'MGF', N'MALAGASY FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1162, N'MKD', N'Macedonian DENAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1163, N'MMK', N'Burmese KYAT', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1164, N'MNT', N'Mongolian TUGRIK', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1165, N'MOP', N'MACAU PATACA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1166, N'MRO', N'Mauritanian OUGUIYA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1167, N'MUR', N'MAURITIUS RUPEE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1168, N'MVR', N'Maldivian RUFIYAA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1169, N'MWK', N'Malawian KWACHA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1170, N'MXN', N'Mexican Peso', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1171, N'MZM', N'Mozambican METICAL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1172, N'NAD', N'NAMIBIA DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1173, N'NGN', N'Nigerian NAIRA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1174, N'NIO', N'Nicaraguan CORDOBA Oro', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1175, N'NPR', N'NEPALESE RUPEE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1176, N'NZD', N'New Zealand Dollar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1177, N'OMR', N'Omani Rial', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1178, N'PAB', N'Panamanian BALBOA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1179, N'PEN', N'Peruvian NUEVO SOL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1180, N'PGK', N'Papua New Guinean KINA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1181, N'PHP', N'PHILIPPINE PESO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1182, N'PKR', N'PAKISTAN RUPEE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1183, N'PYG', N'Paraguayan GUARANI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1184, N'QAR', N'Qatari Rial', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1185, N'RMB', N'CHINESE YUAN RMB', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1186, N'RON', N'Romanian New Leu', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1187, N'RSD', N'Serbian Dinar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1188, N'RUB', N'Russian Rouble', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1189, N'RWF', N'RWANDA FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1190, N'SAR', N'Saudi Riyal', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1191, N'SBD', N'Solomon Islander DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1192, N'SCR', N'SEYCHEL. RUPEE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1193, N'SDD', N'SUDANESE DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1194, N'SEK', N'Swedish Krona', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1196, N'SLL', N'Sierra Leonean LEONE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1197, N'SOS', N'SOM. SHILLING', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1198, N'SRG', N'SURINAM GUILDER', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1199, N'STD', N'DOBRA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1200, N'SVC', N'EL SALV. COLON', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1201, N'SYP', N'SYRIAN POUND', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1202, N'SZL', N'LILANGENI', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1203, N'TJR', N'TAJIK RUBLE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1204, N'TJS', N'Somoni', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1205, N'TMM', N'MANAT', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1206, N'TND', N'Tunisian Dinar', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1207, N'TOP', N'Tongan PA ANGA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1208, N'TPE', N'TIMOR ESCUDO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1209, N'TRY', N'Turkish New Lira', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1210, N'TTD', N'Trinidad and Tobago DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1211, N'TWD', N'NEW TWN. DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1212, N'TZS', N'TANZN. SHILLING', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1213, N'UAH', N'Ukrainian HRYVNIA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1214, N'UGX', N'UGANDA SHILLING', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1216, N'UYU', N'PESO URUGUAYO', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1217, N'UZS', N'UZBEKISTAN SUM', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1218, N'VEB', N'BOLIVAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1219, N'VEF', N'VenezUEL_Test1an Bolivar Fuerte', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1220, N'VND', N'Vietnamese DONG', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1221, N'WST', N'Samoan TALA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1222, N'XAF', N'Central African FRANC BEAC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1223, N'XCD', N'EAST. C. DOLLAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1224, N'XDR', N'SP. DRWG. RIGHT', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1225, N'XEU', N'UNIDAD MONETARIA EUROPEA      ', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1226, N'XOF', N'FRANCO CFA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1227, N'XPF', N'French Pacific FRANC', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1228, N'YER', N'YEMENI RIAL', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1229, N'YUM', N'NEW DINAR', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1230, N'ZMK', N'Zambian KWACHA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1231, N'ZMW', N'Zambian KWACHA', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1232, N'ZRN', N'NEW ZAIRE', 0, NULL)
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1233, N'MD', N'Malaysian Dollars', 0, N'M')
GO
INSERT [dbo].[Currencies] ([Id], [Code], [Name], [Status], [Symbol]) VALUES (1234, N'RU', N'Indian ', 0, N'IND')
GO
SET IDENTITY_INSERT [dbo].[Currencies] OFF
GO
SET IDENTITY_INSERT [dbo].[DocumentStatus] ON 

GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (1, N'Open
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (2, N'Closed
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (3, N'Consent
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (4, N'Exported
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (5, N'Accrued
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (6, N'Paid
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (7, N'Disagreed
')
GO
INSERT [dbo].[DocumentStatus] ([StatusId], [StatusText]) VALUES (8, N'Sent to Supplier
')
GO
SET IDENTITY_INSERT [dbo].[DocumentStatus] OFF
GO
SET IDENTITY_INSERT [dbo].[GSTStatus] ON 

GO
INSERT [dbo].[GSTStatus] ([GSTStatusId], [StatusText], [IsDeleted], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate]) VALUES (1, N'Registered', 0, 78, NULL, 78, NULL)
GO
INSERT [dbo].[GSTStatus] ([GSTStatusId], [StatusText], [IsDeleted], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate]) VALUES (2, N'Not Registered', 0, 78, NULL, 78, NULL)
GO
INSERT [dbo].[GSTStatus] ([GSTStatusId], [StatusText], [IsDeleted], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate]) VALUES (3, N'Overseas', 0, 78, NULL, 78, NULL)
GO
SET IDENTITY_INSERT [dbo].[GSTStatus] OFF
GO
SET IDENTITY_INSERT [dbo].[JobStatus] ON 

GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (1, N'New', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (2, N'Engineer Assigned', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (3, N'InProgress', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (4, N'Completed', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (5, N'Billed', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (6, N'Closed', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (7, N'Hold', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (8, N'Pending Acceptance', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (9, N'Accepted', 0)
GO
INSERT [dbo].[JobStatus] ([StatusId], [Status], [isDeleted]) VALUES (10, N'Not Accepted', 0)
GO
SET IDENTITY_INSERT [dbo].[JobStatus] OFF
GO
SET IDENTITY_INSERT [dbo].[Organization] ON 

GO
INSERT [dbo].[Organization] ([OrganizationId], [OrganizationCode], [OrganizationName], [OrganizationDescription], [Address1], [Address2], [Address3], [Address4], [City], [Country], [Email], [Telephone], [Mobilenumber], [Fax], [Isdeleted], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate], [ZipCode]) VALUES (1, N'100', N'Sparsh', N'sp', N'hyd', NULL, NULL, NULL, N'hyderabad', N'india', N'sparsh@gmail.com', NULL, NULL, NULL, 0, 0, CAST(N'2018-08-01 15:19:11.420' AS DateTime), 0, CAST(N'2018-08-01 15:19:11.420' AS DateTime), N'121001')
GO
SET IDENTITY_INSERT [dbo].[Organization] OFF
GO
SET IDENTITY_INSERT [dbo].[PaymentType] ON 

GO
INSERT [dbo].[PaymentType] ([PaymentTypeID], [Name]) VALUES (1, N'Cash')
GO
INSERT [dbo].[PaymentType] ([PaymentTypeID], [Name]) VALUES (2, N'Cheque')
GO
INSERT [dbo].[PaymentType] ([PaymentTypeID], [Name]) VALUES (3, N'Credit Card')
GO
INSERT [dbo].[PaymentType] ([PaymentTypeID], [Name]) VALUES (4, N'Account Transfer')
GO
SET IDENTITY_INSERT [dbo].[PaymentType] OFF
GO
SET IDENTITY_INSERT [dbo].[Priority] ON 

GO
INSERT [dbo].[Priority] ([PriorityId], [PriorityName]) VALUES (1, N'High')
GO
INSERT [dbo].[Priority] ([PriorityId], [PriorityName]) VALUES (2, N'Medium')
GO
INSERT [dbo].[Priority] ([PriorityId], [PriorityName]) VALUES (3, N'Low')
GO
SET IDENTITY_INSERT [dbo].[Priority] OFF
GO
SET IDENTITY_INSERT [dbo].[PurchaseOrderStatus] ON 

GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (1, N'Draft', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (2, N'Approval', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (3, N'Rejected', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (4, N'Send to Supplier ', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (5, N'Partially Received ', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (6, N'Received', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (7, N'Partially invoiced ', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (8, N'Invoiced ', 0)
GO
INSERT [dbo].[PurchaseOrderStatus] ([StatusId], [Statustext], [IsDeleted]) VALUES (9, N'Void', 0)
GO
SET IDENTITY_INSERT [dbo].[PurchaseOrderStatus] OFF
GO
SET IDENTITY_INSERT [dbo].[PurchaseOrderTypes] ON 

GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (1, N'Inventory PO', N'standard purchase order', 0)
GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (2, N'Fixed Asset PO', N'contract purchase order', 0)
GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (3, N'Expense PO', N'blanket purchase order', 0)
GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (4, N'Project Po', N'planned purchase order', 0)
GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (5, N'Contract PO Fixed', N'Contract PO Fixed', 0)
GO
INSERT [dbo].[PurchaseOrderTypes] ([PurchaseOrderTypeId], [PurchaseOrderType], [Description], [IsDeleted]) VALUES (6, N'Contract PO Variable', N'Contract PO Variable', 0)
GO
SET IDENTITY_INSERT [dbo].[PurchaseOrderTypes] OFF
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 

GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (2, N'Admin')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (1, N'Engineer')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (5, N'SupplierVerifier')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (4, N'Test')
GO
INSERT [dbo].[Roles] ([RoleID], [RoleName]) VALUES (3, N'User')
GO
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[WorkFlowProcess] ON 

GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (1, N'Inventory PO', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (2, N'Fixed Asset PO', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (4, N'Project Po', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (5, N'Contract PO Fixed', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (6, N'Contract PO Variable', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (7, N'Inventory Purchase Request', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (8, N'Asset Purchase Request', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (9, N'Sales Order', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (10, N'Ticket', 0, 2)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (11, N'Asset Transfer', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (12, N'Asset Disposal', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (13, N'Supplier', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (14, N'Expense Purchase Request', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (15, N'Expense PO', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (16, N'LocationTransfer', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (17, N'AssetDepreciation', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (18, N'CreditNote', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (19, N'GoodReturnNotes', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (20, N'GoodRecievedNotes', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (21, N'Supplier Invoice', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (22, N'Project Master Contract', 0, 1)
GO
INSERT [dbo].[WorkFlowProcess] ([ProcessId], [ProcessName], [IsDeleted], [ProcessTypeId]) VALUES (23, N'Project Contract Variation Order', 0, 1)
GO
SET IDENTITY_INSERT [dbo].[WorkFlowProcess] OFF
GO
SET IDENTITY_INSERT [dbo].[WorkFlowStatus] ON 

GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (1, N'intitated', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (2, N'Return for Clarifications', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (3, N'Pending Approval', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (4, N'Approved', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (5, N'Rejected', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (6, N'Draft', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (7, N'Sent to Supplier ', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (8, N'Partially Received ', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (9, N'Received', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (10, N'Partially invoiced ', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (11, N'Invoiced ', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (12, N'Voided', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (13, N'Completed', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (14, N'Exported', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (15, N'Paid', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (16, N'Accrued', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (17, N'Accrued Reversed', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (18, N'Pending Void Approval', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (19, N'Pre Terminate', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (20, N'Return for Void Clarifications', 1)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (21, N'Cancelled Approval', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (22, N'Expired', 0)
GO
INSERT [dbo].[WorkFlowStatus] ([WorkFlowStatusid], [Statustext], [IsApproved]) VALUES (23, N'Terminated', 0)
GO
SET IDENTITY_INSERT [dbo].[WorkFlowStatus] OFF
GO

SET IDENTITY_INSERT [dbo].[JVACode] ON 
GO
INSERT [dbo].[JVACode] ([JVANumber]) VALUES (1)
GO
SET IDENTITY_INSERT [dbo].[JVACode] OFF
GO



SET IDENTITY_INSERT [dbo].[WorkFlowStatusDetails] ON 
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (1, 1, 6, 1)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (2, 1, 3, 2)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (3, 1, 2, 3)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (4, 1, 5, 4)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (5, 1, 4, 5)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (6, 1, 7, 6)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (7, 1, 8, 7)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (8, 1, 9, 8)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (9, 1, 12, 9)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (10, 5, 6, 1)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (11, 5, 2, 2)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (12, 5, 3, 3)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (13, 5, 4, 4)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (14, 5, 5, 5)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (15, 5, 6, 6)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (16, 5, 7, 7)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (17, 5, 12, 8)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (18, 5, 18, 9)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (19, 5, 19, 10)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (20, 5, 20, 11)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (21, 13, 6, 1)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (22, 13, 3, 2)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (23, 13, 2, 3)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (24, 13, 5, 4)
GO
INSERT [dbo].[WorkFlowStatusDetails] ([WorkFlowStatusDetailId], [WorkFlowPrcoessId], [WorkFlowStatuId], [StatusOrder]) VALUES (25, 13, 4, 5)
GO
SET IDENTITY_INSERT [dbo].[WorkFlowStatusDetails] OFF
GO
