package com.codenight.bip.repo;

import com.codenight.bip.domain.PollChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PollChoiceRepo extends JpaRepository<PollChoice, Long> {

    List<PollChoice> findByPoll_PollId(Long pollId);

    boolean existsByPoll_PollIdAndTextIgnoreCase(Long pollId, String text);
}
