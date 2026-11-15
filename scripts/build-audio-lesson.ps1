Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100

$text = @"
Welcome to Digital Workplace Skills: Foundations, Module 1, presented by Digital Bridge.
In this course, we explore essential tools and inclusive workflows for modern distributed teams.

Section 1: Introduction to Workplace Accessibility.
Digital accessibility ensures that applications, spreadsheets, and communications are fully usable by individuals with visual, auditory, motor, and cognitive differences.
In distributed Ethiopian workplaces, applying semantic headings, alternative text for diagrams, and descriptive hyperlinks enables colleagues using screen readers such as NVDA and TalkBack to participate with full autonomy.

Section 2: Universal Keyboard Navigation.
The accessible media player in your learning portal is designed with single-key shortcuts.
You can press Space or K to toggle playback, J to rewind ten seconds, L to fast-forward ten seconds, M to mute, and C to toggle captions.
Sign language interpretation in Ethiopian Sign Language is available at any time by pressing S.

Section 3: Low-Bandwidth Study and Offline Continuity.
When mobile data is limited or connectivity is intermittent, this low-data offline study pack provides the full audio curriculum alongside semantic HTML and tagged PDF documents, consuming less than five percent of the bandwidth required for high-definition video streaming.

Section 4: Summary and Assessment.
As you complete this module, review the accompanying accessible documents, test your comprehension with the review questions, and explore verified career opportunities in the Career Gateway.
Thank you for joining Digital Bridge in advancing inclusive digital employment across Ethiopia.
"@

$wavPath = "lesson-spoken.wav"
$synth.SetOutputToWaveFile($wavPath)
$synth.Speak($text)
$synth.Dispose()

Write-Output "Voice audio successfully synthesized to $wavPath"
