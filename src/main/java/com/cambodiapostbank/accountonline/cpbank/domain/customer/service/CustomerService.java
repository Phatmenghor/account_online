package com.cambodiapostbank.accountonline.cpbank.domain.customer.service;


import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;

import javax.servlet.http.HttpSession;
import java.io.IOException;

public interface CustomerService {
    String createJsonRequestCustomerPost(CustomerRequestDto customerRequestDto) throws IOException;
    String createJsonRequestStaffPost(CustomerRequestDto customerRequestDto, HttpSession session) throws IOException;
}
