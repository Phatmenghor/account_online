package com.internal.feature.telegram_alerts.model;

import com.internal.config.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "telegram_message_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramMessageLog extends BaseEntity {

    @Column(name = "chat_id", nullable = false, length = 100)
    private String chatId;

    @Column(name = "message_id", nullable = false)
    private Long messageId;
}
