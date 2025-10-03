package com.codenight.bip.repo;

import com.codenight.bip.domain.PollChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PollChoiceRepo extends JpaRepository<PollChoice, Long> {

    // Bir ankete ait tüm şıklar
    List<PollChoice> findByPoll_PollId(Long pollId);

    // Aynı metin şık olarak zaten var mı? (büyük/küçük harf duyarsız)
    boolean existsByPoll_PollIdAndTextIgnoreCase(Long pollId, String text);
}
