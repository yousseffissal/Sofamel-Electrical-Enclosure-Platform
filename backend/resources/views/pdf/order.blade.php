<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>SOFAMEL #{{ $order->id }}</title>

    <style>
        #footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 13px;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            padding-bottom: 80px;
        }

        .page-border-top {
            height: 20px;
            background: #ff6a00;
        }

        /* ── HEADER ── */
        .header {
            padding: 20px 32px 16px;
            border-bottom: 1px solid #e0e0e0;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .brand-block {
            vertical-align: middle;
        }

        .invoice-block {
            text-align: right;
            vertical-align: middle;
        }

        .brand-name {
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #1a1a1a;
            text-transform: uppercase;
        }

        .brand-sub {
            font-size: 10px;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #ff6a00;
            margin-top: 3px;
        }

        .invoice-tag {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #999;
        }

        .invoice-num {
            font-size: 26px;
            font-weight: bold;
            color: #ff6a00;
            letter-spacing: 1px;
        }

        /* ── SECTION LABEL ── */
        .section-label {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #888;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 2px solid #ff6a00;
            display: inline-block;
        }

        /* ── TWO-COLUMN LAYOUT ── */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 22px;
        }

        .col-left {
            width: 55%;
            vertical-align: top;
            padding: 0 14px 0 32px;
        }

        .col-right {
            width: 45%;
            vertical-align: top;
            padding: 0 32px 0 0;
        }

        /* ── DATA BLOCK ── */
        .data-block {
            border: 1px solid #ddd;
            margin-bottom: 16px;
        }

        .data-block-header {
            background: #ff6a00;
            color: #fff;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 7px 12px;
            font-weight: bold;
        }

        .data-block-header-dark {
            background: #1a1a1a;
            color: #fff;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 7px 12px;
            font-weight: bold;
        }

        .data-row {
            width: 100%;
            border-collapse: collapse;
        }

        .data-row tr {
            border-bottom: 1px solid #eeeeee;
        }

        .data-row tr:last-child {
            border-bottom: none;
        }

        .data-row tr:nth-child(even) td {
            background: #f9f9f9;
        }

        .data-row td.field-label {
            width: 40%;
            padding: 8px 12px;
            font-size: 11px;
            color: #777;
            vertical-align: top;
            border-right: 1px solid #eeeeee;
        }

        .data-row td.field-value {
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            color: #1a1a1a;
            vertical-align: top;
        }

        .status-pill {
            display: inline-block;
            padding: 3px 12px;
            background: #fff3ec;
            color: #ff6a00;
            border: 1px solid #ff6a00;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        /* ── BADGE ── */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .badge-orange {
            background: #fff3ec;
            color: #ff6a00;
            border: 1px solid #ff6a00;
        }

        .badge-dark {
            background: #f0f0f0;
            color: #1a1a1a;
            border: 1px solid #ccc;
        }

        .badge-green {
            background: #eafaf1;
            color: #1a7a3f;
            border: 1px solid #1a7a3f;
        }

        .badge-red {
            background: #fdecea;
            color: #c0392b;
            border: 1px solid #c0392b;
        }

        /* ── BOX PREVIEW CARD ── */
        .box-preview-card {
            border: 1px solid #ddd;
            margin-bottom: 16px;
        }

        .box-img-wrap {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            background: white;
        }

        .box-img-wrap img {
            width: 100%;
            max-width: 220px;
            display: block;
            margin: 0 auto;
        }

        .box-avatar {
            width: 100%;
            height: 120px;
            background: #ff6a00;
            color: #fff;
            font-size: 52px;
            font-weight: bold;
            text-align: center;
            line-height: 120px;
            letter-spacing: 2px;
        }

        .box-specs {
            width: 100%;
            border-collapse: collapse;
        }

        .box-specs tr {
            border-bottom: 1px solid #eeeeee;
        }

        .box-specs tr:last-child {
            border-bottom: none;
        }

        .box-specs tr:nth-child(even) td {
            background: #f9f9f9;
        }

        .box-specs td.sp-label {
            width: 48%;
            padding: 7px 12px;
            font-size: 11px;
            color: #777;
            border-right: 1px solid #eeeeee;
        }

        .box-specs td.sp-val {
            padding: 7px 12px;
            font-size: 12px;
            font-weight: bold;
            color: #1a1a1a;
        }

        .box-notes-row {
            padding: 9px 12px;
            font-size: 11px;
            color: #888;
            font-style: italic;
            border-top: 1px solid #eeeeee;
            background: #fafafa;
            line-height: 1.5;
        }

        /* ── FULL-WIDTH WRAPPER ── */
        .full-section {
            padding: 0 32px;
            margin-top: 6px;
            margin-bottom: 18px;
        }

        /* ── AREA GROUP ── */
        .area-group {
            margin-bottom: 22px;
        }

        .area-group-header {
            background: #1a1a1a;
            color: #fff;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 7px 12px;
            font-weight: bold;
            border: 1px solid #1a1a1a;
        }

        /* ── ITEMS TABLE ── */
        table.items-tbl {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
            border-top: none;
        }

        table.items-tbl thead tr {
            background: #3a3a3a;
            color: #fff;
        }

        table.items-tbl thead th {
            padding: 9px 12px;
            font-size: 10px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-weight: bold;
            text-align: left;
            border: none;
        }

        table.items-tbl thead th.r {
            text-align: right;
        }

        table.items-tbl tbody tr:nth-child(even) {
            background: #f9f9f9;
        }

        table.items-tbl tbody tr:nth-child(odd) {
            background: #ffffff;
        }

        table.items-tbl tbody td {
            padding: 10px 12px;
            font-size: 12px;
            color: #1a1a1a;
            border-bottom: 1px solid #eeeeee;
            vertical-align: middle;
        }

        table.items-tbl tbody td.r {
            text-align: right;
            font-weight: bold;
        }

        table.items-tbl tbody tr:last-child td {
            border-bottom: none;
        }

        .item-img {
            width: 36px;
            height: 36px;
            border: 1px solid #ddd;
            display: block;
        }

        .item-avatar {
            width: 36px;
            height: 36px;
            background: #ff6a00;
            color: #fff;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            line-height: 36px;
            display: block;
        }

        .item-name {
            font-weight: bold;
            font-size: 12px;
            color: #1a1a1a;
        }

        .item-cat {
            font-size: 10px;
            color: #ff6a00;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .item-code {
            font-size: 10px;
            color: #999;
            font-family: monospace;
        }

        /* ── PRICING BREAKDOWN ── */
        .pricing-section {
            padding: 0 32px;
            margin-bottom: 24px;
        }

        table.pricing-tbl {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
        }

        table.pricing-tbl thead tr {
            background: #1a1a1a;
            color: #fff;
        }

        table.pricing-tbl thead th {
            padding: 9px 14px;
            font-size: 10px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-weight: bold;
            text-align: left;
        }

        table.pricing-tbl thead th.r {
            text-align: right;
        }

        table.pricing-tbl tbody td {
            padding: 10px 14px;
            font-size: 12px;
            border-bottom: 1px solid #eeeeee;
            color: #1a1a1a;
            vertical-align: middle;
        }

        table.pricing-tbl tbody td.r {
            text-align: right;
            font-weight: bold;
        }

        table.pricing-tbl tbody tr:nth-child(even) td {
            background: #f9f9f9;
        }

        table.pricing-tbl tbody tr:last-child td {
            border-bottom: none;
        }

        table.pricing-tbl tfoot tr.subtotal td {
            padding: 9px 14px;
            font-size: 12px;
            font-weight: bold;
            border-top: 2px solid #ddd;
            background: #f4f4f4;
            color: #1a1a1a;
        }

        table.pricing-tbl tfoot tr.subtotal td.r {
            text-align: right;
        }

        table.pricing-tbl tfoot tr.unit-total td {
            padding: 11px 14px;
            font-size: 14px;
            font-weight: bold;
            border-top: 2px solid #ff6a00;
            background: #fff3ec;
            color: #ff6a00;
        }

        table.pricing-tbl tfoot tr.unit-total td.r {
            text-align: right;
        }

        table.pricing-tbl tfoot tr.qty-row td {
            padding: 9px 14px;
            font-size: 12px;
            border-top: 1px solid #ddd;
            background: #f9f9f9;
            color: #555;
        }

        table.pricing-tbl tfoot tr.qty-row td.r {
            text-align: right;
            font-weight: bold;
        }

        table.pricing-tbl tfoot tr.grand-total td {
            padding: 14px 14px;
            font-size: 16px;
            font-weight: bold;
            background: #ff6a00;
            color: #fff;
            border-top: none;
        }

        table.pricing-tbl tfoot tr.grand-total td.r {
            text-align: right;
            font-size: 20px;
        }

        /* ── FOOTER ── */
        #footer-bar {
            height: 3px;
            background: #ff3d2e;
        }

        #footer-body {
            background: #1a1a1a;
            padding: 10px 32px;
        }

        #footer-body table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-brand {
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #ff6a00;
            text-transform: uppercase;
        }

        .footer-tag {
            font-size: 9px;
            letter-spacing: 1.5px;
            color: #666;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .footer-disclaimer {
            font-size: 9px;
            color: #555;
            line-height: 1.6;
            text-align: right;
        }
    </style>
</head>

<body>

    {{-- ══ FIXED FOOTER — must be before body content in dompdf ══ --}}
    <div id="footer">
        <div id="footer-bar"></div>
        <div id="footer-body">
            <table>
                <tr>
                    <td style="vertical-align: middle;">
                        <table>
                            <tr>
                                <td style="vertical-align: middle; width: 30px;">
                                    @if($logoBase64)
                                    <img src="{{ $logoBase64 }}"
                                        style="height: 30px; display: block; border-radius: 100%;">
                                    @endif
                                </td>

                                <td style="vertical-align: middle; padding-left: 8px;">
                                    <div class="footer-brand">SOFAMEL</div>
                                    <div class="footer-tag">Electrical & Industrial Solutions</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td style="vertical-align: middle;">
                        <div class="footer-disclaimer">
                            Computer-generated invoice — valid without signature.<br>
                            Prices in Moroccan Dirham (DH). Changes and printing errors reserved.
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    {{-- ══ PAGE CONTENT ══ --}}

    <div class="page-border-top"></div>

    {{-- ── HEADER ── --}}
    <div class="header">
        <table class="header-table">
            <tr>

                <td class="brand-block" style="vertical-align: middle;">

                    <table>
                        <tr>
                            <td style="vertical-align: middle; width: 50px;">
                                @if($logoBase64)
                                <img src="{{ $logoBase64 }}"
                                    style="height: 60px; display: block; border-radius: 100%;">
                                @endif
                            </td>

                            <td style="vertical-align: middle; padding-left: 10px;">
                                <div class="brand-name">SOFAMEL</div>
                                <div class="brand-sub">Electrical & Industrial Equipment</div>
                            </td>
                        </tr>
                    </table>

                </td>

                <td class="invoice-block" style="vertical-align: middle; text-align: right;">
                    <div class="invoice-tag">Invoice</div>
                    <div class="invoice-num">#{{ $order->id }}</div>
                </td>

            </tr>
        </table>
    </div>

    {{-- ── TWO-COLUMN: ORDER INFO + BOX DETAILS ── --}}
    @php
    $cfg = $order->configuration;
    $box = $cfg?->configurableBox;
    $boxType = $box?->boxType;
    @endphp

    <table class="main-table">
        <tr>

            {{-- LEFT: order info + client + box type specs --}}
            <td class="col-left">

                <div class="data-block">
                    <div class="data-block-header">Order Information</div>
                    <table class="data-row">
                        <tr>
                            <td class="field-label">Invoice No.</td>
                            <td class="field-value">#{{ $order->id }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Date</td>
                            <td class="field-value">{{ \Carbon\Carbon::parse($order->created_at)->format('d M Y') }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Status</td>
                            <td class="field-value">
                                <span class="status-pill">{{ strtoupper($order->status) }}</span>
                            </td>
                        </tr>
                        @if($cfg)
                        <tr>
                            <td class="field-label">Order Quantity</td>
                            <td class="field-value">{{ $cfg->quantity }} unit{{ $cfg->quantity > 1 ? 's' : '' }}</td>
                        </tr>
                        @endif
                    </table>
                </div>

                <div class="data-block">
                    <div class="data-block-header">Bill To</div>
                    <table class="data-row">
                        <tr>
                            <td class="field-label">Full Name</td>
                            <td class="field-value">{{ $order->user->name }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Email</td>
                            <td class="field-value">{{ $order->user->email }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Phone</td>
                            <td class="field-value">{{ $order->phone }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Address</td>
                            <td class="field-value">{{ $order->address }}</td>
                        </tr>
                    </table>
                </div>

                @if($boxType)
                <div class="data-block">
                    <div class="data-block-header-dark">Box Type — Technical Specs</div>
                    <table class="data-row">
                        <tr>
                            <td class="field-label">Type Code</td>
                            <td class="field-value">{{ $boxType->code }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Family / Variant</td>
                            <td class="field-value">{{ $boxType->family }} / {{ $boxType->variant }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Material</td>
                            <td class="field-value">{{ $boxType->material }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Mounting</td>
                            <td class="field-value">{{ $boxType->mounting_type }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Color</td>
                            <td class="field-value">{{ $boxType->color }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">IP Rating</td>
                            <td class="field-value"><span class="badge badge-dark">{{ $boxType->ip_rating }}</span></td>
                        </tr>
                        <tr>
                            <td class="field-label">Dimensions (W×H×D)</td>
                            <td class="field-value">{{ $boxType->width_mm }} × {{ $boxType->height_mm }} × {{ $boxType->depth_mm }} mm</td>
                        </tr>
                        <tr>
                            <td class="field-label">Branch Cables</td>
                            <td class="field-value">{{ $boxType->branch_cable_count }}</td>
                        </tr>
                        <tr>
                            <td class="field-label">Overcurrent Prot.</td>
                            <td class="field-value">
                                @if($boxType->has_overcurrent)
                                <span class="badge badge-green">Yes</span>
                                @else
                                <span class="badge badge-red">No</span>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td class="field-label">Earth Leakage</td>
                            <td class="field-value">
                                @if($boxType->has_earth_leakage)
                                <span class="badge badge-green">{{ $boxType->earth_leakage_rating ?? 'Yes' }}</span>
                                @else
                                <span class="badge badge-red">No</span>
                                @endif
                            </td>
                        </tr>
                        @if($boxType->description)
                        <tr>
                            <td class="field-label">Description</td>
                            <td class="field-value" style="font-weight: normal; font-size: 11px; color: #555;">{{ $boxType->description }}</td>
                        </tr>
                        @endif
                    </table>
                </div>
                @endif

            </td>

            {{-- RIGHT: box preview + template specs + areas --}}
            <td class="col-right">

                @if($cfg && $box)
                <div class="box-preview-card">
                    <div class="data-block-header-dark">Configuration Template</div>

                    <div class="box-img-wrap">
                        @php
                        $hasBoxImg = $boxImageBase64 && !str_contains($boxImageBase64, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
                        @endphp
                        @if($hasBoxImg)
                        <img src="{{ $boxImageBase64 }}">
                        @else
                        <div class="box-avatar">
                            {{ substr($box->code ?? 'B', 0, 1) }}
                        </div>
                        @endif
                    </div>

                    <table class="box-specs">
                        <tr>
                            <td class="sp-label">Template Code</td>
                            <td class="sp-val">{{ $box->code }}</td>
                        </tr>
                        <tr>
                            <td class="sp-label">Max Items</td>
                            <td class="sp-val">{{ $box->max_total_items }}</td>
                        </tr>
                        <tr>
                            <td class="sp-label">Base Price / Unit</td>
                            <td class="sp-val" style="color: #ff6a00;">{{ number_format($cfg->box_price_snapshot, 2) }} DH</td>
                        </tr>
                    </table>

                    @if($box->notes)
                    <div class="box-notes-row">{{ $box->notes }}</div>
                    @endif
                </div>

                {{-- AREAS defined on this box template --}}
                @php $boxAreas = $box->areas ?? collect(); @endphp
                @if($boxAreas->count())
                <div class="data-block">
                    <div class="data-block-header-dark">Box Areas</div>
                    <table class="box-specs">
                        @foreach($boxAreas as $area)
                        <tr>
                            <td class="sp-label">{{ $area->name }}</td>
                            <td class="sp-val" style="font-size: 11px; font-weight: normal; color: #555;">
                                {{ $area->pivot->width_mm }} × {{ $area->pivot->height_mm }} mm
                                @if($area->pivot->padding_mm)
                                &nbsp;<span style="color: #aaa;">(pad {{ $area->pivot->padding_mm }} mm)</span>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </table>
                </div>
                @endif

                @endif

            </td>

        </tr>
    </table>

    {{-- ── ITEMS GROUPED BY AREA ── --}}
    @if($cfg && $cfg->configurationItems->count())

    @php
    $itemsByArea = $cfg->configurationItems->groupBy(fn($ci) => $ci->area?->name ?? 'Unassigned');
    @endphp

    <div class="full-section">
        <div style="margin-bottom: 10px;">
            <span class="section-label">Configured Items by Area</span>
        </div>

        @foreach($itemsByArea as $areaName => $areaItems)
        <div class="area-group">
            <div class="area-group-header">
                Area: {{ $areaName }}
                &nbsp;&nbsp;·&nbsp;&nbsp;
                {{ $areaItems->count() }} line{{ $areaItems->count() > 1 ? 's' : '' }}
                &nbsp;&nbsp;·&nbsp;&nbsp;
                {{ $areaItems->sum('quantity') }} item{{ $areaItems->sum('quantity') > 1 ? 's' : '' }}
            </div>

            <table class="items-tbl">
                <thead>
                    <tr>
                        <th style="width: 44px;"></th>
                        <th>Item</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Specs</th>
                        <th class="r">Qty</th>
                        <th class="r">Unit Price</th>
                        <th class="r">Line Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($areaItems as $ci)
                    @php
                    $imgSrc = $itemImages[$ci->item?->id] ?? null;
                    $hasImg = $imgSrc && !str_contains($imgSrc, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
                    $lineTotal = $ci->quantity * $ci->price_snapshot;
                    @endphp
                    <tr>
                        <td>
                            @if($hasImg)
                            <img class="item-img" src="{{ $imgSrc }}">
                            @else
                            <div class="item-avatar">{{ substr($ci->item?->category ?? 'I', 0, 1) }}</div>
                            @endif
                        </td>
                        <td>
                            <div class="item-name">{{ $ci->item?->name }}</div>
                        </td>
                        <td>
                            <div class="item-code">{{ $ci->item?->code }}</div>
                        </td>
                        <td>
                            <div class="item-cat">{{ $ci->item?->category }}</div>
                        </td>
                        <td>
                            @if($ci->item?->amperage)
                            <span class="badge badge-dark">{{ $ci->item->amperage }}A</span>&nbsp;
                            @endif
                            @if($ci->item?->poles)
                            <span class="badge badge-dark">{{ $ci->item->poles }}P</span>&nbsp;
                            @endif
                            @if($ci->item?->voltage)
                            <span class="badge badge-orange">{{ $ci->item->voltage }}V</span>
                            @endif
                        </td>
                        <td class="r">{{ $ci->quantity }}</td>
                        <td class="r">{{ number_format($ci->price_snapshot, 2) }} DH</td>
                        <td class="r">{{ number_format($lineTotal, 2) }} DH</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endforeach
    </div>

    @endif

    {{-- ── PRICING BREAKDOWN ── --}}
    @if($cfg)
    <div class="pricing-section">
        <div style="margin-bottom: 10px;">
            <span class="section-label">Pricing Breakdown</span>
        </div>

        <table class="pricing-tbl">
            <thead>
                <tr>
                    <th style="width: 52%;">Description</th>
                    <th class="r">Qty</th>
                    <th class="r">Unit Price</th>
                    <th class="r">Line Total</th>
                </tr>
            </thead>
            <tbody>
                {{-- Box base price --}}
                <tr>
                    <td>
                        <strong>Configuration Box</strong><br>
                        <span style="font-size: 11px; color: #888;">{{ $box?->code }}</span>
                    </td>
                    <td class="r">1</td>
                    <td class="r">{{ number_format($cfg->box_price_snapshot, 2) }} DH</td>
                    <td class="r">{{ number_format($cfg->box_price_snapshot, 2) }} DH</td>
                </tr>
                {{-- Each item line --}}
                @foreach($cfg->configurationItems as $ci)
                @php $lineTotal = $ci->quantity * $ci->price_snapshot; @endphp
                <tr>
                    <td>
                        <strong>{{ $ci->item?->name }}</strong>
                        <span style="font-size: 11px; color: #888; font-weight: normal;">
                            &nbsp;·&nbsp; {{ $ci->area?->name ?? '—' }}
                            @if($ci->item?->code)
                            &nbsp;·&nbsp; <span style="font-family: monospace;">{{ $ci->item->code }}</span>
                            @endif
                        </span>
                    </td>
                    <td class="r">{{ $ci->quantity }}</td>
                    <td class="r">{{ number_format($ci->price_snapshot, 2) }} DH</td>
                    <td class="r">{{ number_format($lineTotal, 2) }} DH</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                {{-- Items-only subtotal --}}
                <tr class="subtotal">
                    <td colspan="3">Items Subtotal (per unit box)</td>
                    <td class="r">{{ number_format($itemsTotal, 2) }} DH</td>
                </tr>
                {{-- Unit total = box price + all items --}}
                <tr class="unit-total">
                    <td colspan="3">Total per Unit &nbsp;(Box + Items)</td>
                    <td class="r">{{ number_format($unitTotal, 2) }} DH</td>
                </tr>
                {{-- Quantity multiplier row --}}
                <tr class="qty-row">
                    <td colspan="3">
                        Quantity ordered &nbsp;×&nbsp; {{ $cfg->quantity }} unit{{ $cfg->quantity > 1 ? 's' : '' }}
                        &nbsp;&nbsp;
                        <span style="font-size: 11px;">({{ number_format($unitTotal, 2) }} DH × {{ $cfg->quantity }})</span>
                    </td>
                    <td class="r">= {{ number_format($grandTotal, 2) }} DH</td>
                </tr>
                {{-- Grand total --}}
                <tr class="grand-total">
                    <td colspan="3">GRAND TOTAL</td>
                    <td class="r">{{ number_format($grandTotal, 2) }} DH</td>
                </tr>
            </tfoot>
        </table>
    </div>
    @endif

</body>

</html>