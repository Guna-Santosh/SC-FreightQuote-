package com.freight.app.controller;

import com.freight.app.model.*;
import com.freight.app.service.CarrierQuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freight")
@CrossOrigin(origins = "http://localhost:4200")
public class FreightController {

    @Autowired
    private CarrierQuoteService quoteService;

    /**
     * Fetch order details to prepopulate the form
     */
    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<OrderDetailsResponse> getOrderDetails(@PathVariable String orderNumber) {
        // Logic to fetch order from ERP/Database
        return ResponseEntity.ok(quoteService.fetchOrderDetails(orderNumber));
    }

    /**
     * Get real-time quotes from selected carriers
     */
    @PostMapping("/quotes")
    public ResponseEntity<List<QuoteResponse>> getQuotes(@RequestBody QuoteRequest request) {
        try {
            List<QuoteResponse> quotes = quoteService.calculateQuotes(
                request.getSource(),
                request.getDestination(),
                request.getLines(),
                request.getCarriers()
            );
            return ResponseEntity.ok(quotes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

/* 
Required DTO Structure:

public class QuoteRequest {
    private Address source;
    private Address destination;
    private List<FreightLineItem> lines;
    private List<String> carriers;
    // Getters/Setters
}

public class QuoteResponse {
    private String carrierName;
    private String serviceType;
    private Integer transitDays;
    private Double totalCharge;
    private Double fuelSurcharge;
    private Double accessorialCharges;
    private String estimatedDeliveryDate;
    // Getters/Setters
}
*/
