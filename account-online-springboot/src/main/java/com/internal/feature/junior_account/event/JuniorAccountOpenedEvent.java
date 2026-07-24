package com.internal.feature.junior_account.event;

import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class JuniorAccountOpenedEvent extends ApplicationEvent {
    private final JuniorCustomerRequest request;
    private final OpenAccountContext context;
    private final String amlStatusStr;
    private final boolean hasNid;

    public JuniorAccountOpenedEvent(Object source, JuniorCustomerRequest request, OpenAccountContext context, String amlStatusStr, boolean hasNid) {
        super(source);
        this.request = request;
        this.context = context;
        this.amlStatusStr = amlStatusStr;
        this.hasNid = hasNid;
    }
}
