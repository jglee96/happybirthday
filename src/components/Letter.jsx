import { useEffect, useRef } from 'react'

export function Letter() {
  const cardRef = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) cardRef.current?.classList.add('visible') },
      { threshold: 0.15 }
    )
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <span className="divider" />
      <section className="letter-section">
        <div className="letter-card" ref={cardRef}>
          <p className="letter-from">From 거니 · 2026년 4월 18일</p>
          <p className="letter-body">
            마니야,<br /><br />
            생일 축하해.<br /><br />
            오늘도 어김없이 4월 18일이 돌아왔어.
            매년 이날이 오면 나는 네가 이 세상에 태어나줘서
            얼마나 다행인지 다시 한번 느껴.<br /><br />
            스물여덟이라는 숫자가 낯설게 느껴질 수도 있겠지만,
            <em>네 옆에 거니가 있잖아.</em><br /><br />
            웃을 때 눈이 반달이 되는 것도,
            맛있는 걸 먹을 때 행복해하는 표정도,
            아무것도 아닌 날들을 특별하게 만드는 것도
            전부 마니 덕분이야.<br /><br />
            오늘 하루만큼은 네가 받아 마땅한 사랑을
            다 받았으면 좋겠어.<br /><br />
            항상 건강하고, 하고 싶은 거 다 하고,
            <em>나랑 오래오래 함께하자.</em><br /><br />
            사랑해, 마니. 🤍
          </p>
          <p className="letter-sig">— 거니가 💛</p>
        </div>
      </section>
    </>
  )
}
