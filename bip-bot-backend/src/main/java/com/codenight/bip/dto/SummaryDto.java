package com.codenight.bip.dto;

import com.codenight.bip.domain.PollChoice;
import com.codenight.bip.domain.Slot;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Data @AllArgsConstructor
public class SummaryDto {
    private Long eventId;
    private String title;
    private Slot winnerSlot;
    private PollChoice winnerPlace;
    private BigDecimal total;
    private Map<String, BigDecimal> balances;

    public String toShortText(){
        String date = winnerSlot==null? "-" :
                DateTimeFormatter.ISO_INSTANT.format(winnerSlot.getStartTime());
        String place = winnerPlace==null? "-" : winnerPlace.getText();
        return "Tarih: " + date + " | Mekan: " + place + " | Toplam: " + total;
    }

    public String toPrettyText(){
        StringBuilder sb = new StringBuilder();
        sb.append("📌 Etkinlik #").append(eventId).append(" — ").append(title).append("\n");
        sb.append("🗓️ Önerilen Tarih: ");
        sb.append(winnerSlot==null? "-" : winnerSlot.getStartTime()+" - "+winnerSlot.getEndTime()).append("\n");
        sb.append("📍 Önerilen Mekan: ").append(winnerPlace==null? "-" : winnerPlace.getText()).append("\n");
        sb.append("💰 Toplam: ").append(total).append("\n");
        sb.append("👥 Bakiye (alacak + / borç -):\n");
        if(balances!=null){
            balances.forEach((u,b)-> sb.append(" - ").append(u).append(": ").append(b).append("\n"));
        }
        return sb.toString();
    }
}
