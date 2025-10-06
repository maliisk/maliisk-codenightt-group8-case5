package com.codenight.bip.repo;

import com.codenight.bip.domain.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepo extends JpaRepository<Expense, Long> {

    List<Expense> findByEvent_EventId(Long eventId);

    List<Expense> findByEvent_EventIdAndUserId(Long eventId, String userId);
}
